const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the viewer page
app.get('/view/:streamId?', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'viewer.html'));
});

// Store active streams
const activeStreams = new Map();

// Store socket to stream ID mapping
const socketToStreamId = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Send list of active streams to new clients
  socket.emit('active-streams', Array.from(activeStreams.values()));
  
  // Host starts streaming
  socket.on('start-stream', (streamInfo) => {
    // Generate a unique ID if not provided
    const streamId = streamInfo.id || uuidv4();
    console.log('Stream started:', streamId);
    
    // Add stream info to active streams
    const stream = {
      id: streamId,
      name: streamInfo.name || 'Unnamed Stream',
      hostId: socket.id,
      createdAt: new Date().toISOString()
    };
    
    activeStreams.set(streamId, stream);
    socketToStreamId.set(socket.id, streamId);
    
    // Notify the host about the stream ID
    socket.emit('stream-started', {
      id: streamId,
      url: `/view/${streamId}`
    });
    
    // Notify all clients about the new stream
    socket.broadcast.emit('stream-added', stream);
  });
  
  // Host stops streaming
  socket.on('stop-stream', () => {
    const streamId = socketToStreamId.get(socket.id);
    
    if (streamId && activeStreams.has(streamId)) {
      const streamInfo = activeStreams.get(streamId);
      console.log('Stream stopped:', streamId);
      
      // Remove stream from active streams
      activeStreams.delete(streamId);
      socketToStreamId.delete(socket.id);
      
      // Notify all clients about the removed stream
      socket.broadcast.emit('stream-removed', { 
        id: streamId,
        hostId: socket.id 
      });
    }
  });
  
  // Client requests a specific stream
  socket.on('get-stream', (streamId) => {
    if (activeStreams.has(streamId)) {
      const stream = activeStreams.get(streamId);
      socket.emit('stream-info', stream);
    } else {
      socket.emit('stream-not-found', { id: streamId });
    }
  });
  
  // WebRTC signaling
  
  // Client sends offer to host
  socket.on('offer', (data) => {
    console.log('Offer received from', socket.id, 'to', data.hostId);
    socket.to(data.hostId).emit('offer', {
      offer: data.offer,
      viewerId: socket.id,
      streamId: data.streamId
    });
  });
  
  // Host sends answer to client
  socket.on('answer', (data) => {
    console.log('Answer received from', socket.id, 'to', data.viewerId);
    socket.to(data.viewerId).emit('answer', {
      answer: data.answer,
      hostId: socket.id
    });
  });
  
  // ICE candidate exchange
  socket.on('ice-candidate', (data) => {
    console.log('ICE candidate received from', socket.id);
    if (data.hostId) {
      socket.to(data.hostId).emit('ice-candidate', {
        candidate: data.candidate,
        viewerId: socket.id
      });
    } else if (data.viewerId) {
      socket.to(data.viewerId).emit('ice-candidate', {
        candidate: data.candidate,
        hostId: socket.id
      });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // If a host disconnects, remove their stream
    const streamId = socketToStreamId.get(socket.id);
    
    if (streamId && activeStreams.has(streamId)) {
      const streamInfo = activeStreams.get(streamId);
      console.log('Stream stopped (host disconnected):', streamId);
      
      // Remove stream from active streams
      activeStreams.delete(streamId);
      socketToStreamId.delete(socket.id);
      
      // Notify all clients about the removed stream
      socket.broadcast.emit('stream-removed', { 
        id: streamId,
        hostId: socket.id 
      });
    }
  });
});

// Create public directory if it doesn't exist
const fs = require('fs');
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
  console.log(`Viewer URL: http://localhost:${PORT}/view`);
});

// Log server IP addresses
const os = require('os');
const networkInterfaces = os.networkInterfaces();
console.log('\nAvailable on:');
Object.keys(networkInterfaces).forEach((interfaceName) => {
  const interfaces = networkInterfaces[interfaceName];
  interfaces.forEach((iface) => {
    // Skip internal and non-IPv4 addresses
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`http://${iface.address}:${PORT}`);
    }
  });
});
