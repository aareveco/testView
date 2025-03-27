const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();
const { v4: uuidv4 } = require('uuid');

// Create Express app
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Trust the ngrok proxy
app.set('trust proxy', true);

// Add middleware to handle ngrok proxy headers
app.use((req, res, next) => {
  // Check for ngrok headers
  if (req.headers['x-forwarded-proto'] === 'https') {
    req.headers['x-forwarded-proto'] = 'https';
    req.headers['x-forwarded-ssl'] = 'on';
  }
  next();
});

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["*", "ngrok-skip-browser-warning"]
  },
  transports: ['polling'], // Use only polling for ngrok compatibility
  allowEIO3: true, // Allow older versions of Socket.IO clients
  pingTimeout: 60000, // Increase ping timeout for ngrok
  pingInterval: 25000, // Increase ping interval for ngrok
  connectTimeout: 45000, // Increase connection timeout for ngrok
  maxHttpBufferSize: 1e8, // Increase buffer size for larger messages
  parser: socketIo.parser // Use the default parser
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

// Store remote control sessions
const remoteControlSessions = new Map(); // { streamId: { hostId, viewerId, active } }

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Send list of active streams to new clients
  socket.emit('active-streams', Array.from(activeStreams.values()));

  // Host starts streaming
  socket.on('start-stream', (streamInfo) => {
    console.log('Received start-stream event with data:', JSON.stringify(streamInfo));
    console.log('Socket ID:', socket.id);
    console.log('Socket connected status:', socket.connected);

    try {
      // Validate stream info
      if (!streamInfo) {
        console.error('Invalid stream info: null or undefined');
        socket.emit('stream-error', {
          error: 'Failed to start stream',
          details: 'Invalid stream info: null or undefined'
        });
        return;
      }

      // Generate a unique ID if not provided
      const streamId = streamInfo.id || uuidv4();
      console.log('Generated stream ID:', streamId);

      // Add stream info to active streams
      const stream = {
        id: streamId,
        name: streamInfo.name || 'Unnamed Stream',
        hostId: socket.id,
        createdAt: new Date().toISOString(),
        clientInfo: streamInfo.clientId || 'unknown',
        debug: streamInfo.debug || '',
        retry: streamInfo.retry || false
      };

      console.log('Creating stream object:', JSON.stringify(stream));

      // Check if this socket already has a stream
      const existingStreamId = socketToStreamId.get(socket.id);
      if (existingStreamId) {
        console.log('Socket already has a stream, removing old stream:', existingStreamId);
        activeStreams.delete(existingStreamId);
      }

      activeStreams.set(streamId, stream);
      socketToStreamId.set(socket.id, streamId);

      // Create response data
      const responseData = {
        id: streamId,
        url: `/view/${streamId}`,
        timestamp: new Date().toISOString()
      };

      console.log('Sending stream-started event with data:', JSON.stringify(responseData));

      // Notify the host about the stream ID
      socket.emit('stream-started', responseData);

      // Send a delayed duplicate response as a backup in case the first one is missed
      setTimeout(() => {
        if (socket.connected) {
          console.log('Sending delayed duplicate stream-started event');
          socket.emit('stream-started', {
            ...responseData,
            duplicate: true
          });
        }
      }, 1000);

      // Notify all clients about the new stream
      socket.broadcast.emit('stream-added', stream);

      console.log('Stream setup completed successfully');
    } catch (error) {
      console.error('Error processing start-stream event:', error);
      socket.emit('stream-error', {
        error: 'Failed to start stream',
        details: error.message
      });
    }
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

  // Remote Control Functionality

  // Remote control request from viewer
  socket.on('request-remote-control', (data) => {
    const streamId = data.streamId;
    console.log('Remote control requested for stream:', streamId);

    if (activeStreams.has(streamId)) {
      const stream = activeStreams.get(streamId);
      const hostSocket = io.sockets.sockets.get(stream.hostId);

      if (hostSocket) {
        // Forward the request to the host
        hostSocket.emit('remote-control-requested', {
          streamId: streamId,
          viewerId: socket.id
        });

        // Create a pending remote control session
        remoteControlSessions.set(streamId, {
          hostId: stream.hostId,
          viewerId: socket.id,
          active: false,
          pending: true
        });

        socket.emit('remote-control-request-sent', { streamId });
      } else {
        socket.emit('remote-control-error', {
          streamId,
          error: 'Host not connected'
        });
      }
    } else {
      socket.emit('remote-control-error', {
        streamId,
        error: 'Stream not found'
      });
    }
  });

  // Remote control response from host
  socket.on('remote-control-response', (data) => {
    const { streamId, viewerId, accepted } = data;
    console.log(`Remote control ${accepted ? 'accepted' : 'rejected'} for stream:`, streamId);

    if (remoteControlSessions.has(streamId)) {
      const session = remoteControlSessions.get(streamId);
      const viewerSocket = io.sockets.sockets.get(viewerId);

      if (viewerSocket) {
        if (accepted) {
          // Update the session to active
          session.active = true;
          session.pending = false;
          remoteControlSessions.set(streamId, session);

          // Notify the viewer
          viewerSocket.emit('remote-control-accepted', { streamId });

          // Notify the host
          socket.emit('remote-control-started', {
            streamId,
            viewerId
          });
        } else {
          // Remove the session
          remoteControlSessions.delete(streamId);

          // Notify the viewer
          viewerSocket.emit('remote-control-rejected', { streamId });
        }
      } else {
        // Viewer disconnected
        remoteControlSessions.delete(streamId);
        socket.emit('remote-control-error', {
          streamId,
          error: 'Viewer disconnected'
        });
      }
    } else {
      socket.emit('remote-control-error', {
        streamId,
        error: 'No pending remote control request'
      });
    }
  });

  // Stop remote control from either host or viewer
  socket.on('stop-remote-control', (data) => {
    const { streamId } = data;
    console.log('Stopping remote control for stream:', streamId);

    if (remoteControlSessions.has(streamId)) {
      const session = remoteControlSessions.get(streamId);
      const hostSocket = io.sockets.sockets.get(session.hostId);
      const viewerSocket = io.sockets.sockets.get(session.viewerId);

      // Notify both parties
      if (hostSocket && hostSocket.id !== socket.id) {
        hostSocket.emit('remote-control-ended', { streamId });
      }

      if (viewerSocket && viewerSocket.id !== socket.id) {
        viewerSocket.emit('remote-control-ended', { streamId });
      }

      // Remove the session
      remoteControlSessions.delete(streamId);

      // Confirm to the requester
      socket.emit('remote-control-stopped', { streamId });
    } else {
      socket.emit('remote-control-error', {
        streamId,
        error: 'No active remote control session'
      });
    }
  });

  // Forward remote control events from viewer to host
  socket.on('remote-control-event', (data) => {
    const { streamId, eventType, eventData } = data;

    if (remoteControlSessions.has(streamId)) {
      const session = remoteControlSessions.get(streamId);

      // Only forward if the session is active and the sender is the viewer
      if (session.active && session.viewerId === socket.id) {
        const hostSocket = io.sockets.sockets.get(session.hostId);

        if (hostSocket) {
          hostSocket.emit('remote-control-event', {
            streamId,
            eventType,
            eventData
          });
        }
      }
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

      // End any remote control sessions for this stream
      if (remoteControlSessions.has(streamId)) {
        const session = remoteControlSessions.get(streamId);
        if (session.active) {
          // Notify the viewer that remote control has ended
          const viewerSocket = io.sockets.sockets.get(session.viewerId);
          if (viewerSocket) {
            viewerSocket.emit('remote-control-ended', { streamId });
          }
        }
        remoteControlSessions.delete(streamId);
      }

      // Remove stream from active streams
      activeStreams.delete(streamId);
      socketToStreamId.delete(socket.id);

      // Notify all clients about the removed stream
      socket.broadcast.emit('stream-removed', {
        id: streamId,
        hostId: socket.id
      });
    }

    // Check if this socket was a viewer with remote control
    for (const [streamId, session] of remoteControlSessions.entries()) {
      if (session.viewerId === socket.id) {
        console.log('Viewer with remote control disconnected, ending session:', streamId);

        // Notify the host that remote control has ended
        const hostSocket = io.sockets.sockets.get(session.hostId);
        if (hostSocket) {
          hostSocket.emit('remote-control-ended', { streamId });
        }

        remoteControlSessions.delete(streamId);
        break;
      }
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

  // Display local URLs
  console.log(`Local Server URL: http://localhost:${PORT}`);
  console.log(`Local Viewer URL: http://localhost:${PORT}/view`);

  // Display ngrok URL if available
  if (process.env.NGROK_URL) {
    console.log(`\nNgrok Server URL: ${process.env.NGROK_URL}`);
    console.log(`Ngrok Viewer URL: ${process.env.NGROK_URL}/view`);
  }
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
