// DOM elements - Common
const serverUrlInput = document.getElementById('serverUrl');
const connectServerBtn = document.getElementById('connectServerBtn');
const disconnectServerBtn = document.getElementById('disconnectServerBtn');
const statusMessage = document.getElementById('statusMessage');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Load environment variables if available
const socketServerUrl = window.electron?.env?.SOCKET_SERVER_URL || '';

// DOM elements - Host mode
const getSourcesBtn = document.getElementById('getSourcesBtn');
const sourceList = document.getElementById('sourceList');
const hostVideoContainer = document.getElementById('hostVideoContainer');
const hostVideo = document.getElementById('hostVideo');
const stopSharingBtn = document.getElementById('stopSharingBtn');
const startStreamingBtn = document.getElementById('startStreamingBtn');
const stopStreamingBtn = document.getElementById('stopStreamingBtn');
const serverInfo = document.getElementById('serverInfo');
const streamId = document.getElementById('streamId');
const viewerUrl = document.getElementById('viewerUrl');
const openViewerBtn = document.getElementById('openViewerBtn');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const copyIdBtn = document.getElementById('copyIdBtn');

// DOM elements - Viewer mode
const streamIdInput = document.getElementById('streamIdInput');
const connectToStreamBtn = document.getElementById('connectToStreamBtn');
const streamSelection = document.getElementById('streamSelection');
const streamList = document.getElementById('streamList');
const noStreams = document.getElementById('noStreams');
const viewerVideoContainer = document.getElementById('viewerVideoContainer');
const remoteVideo = document.getElementById('remoteVideo');
const streamTitle = document.getElementById('streamTitle');
const disconnectBtn = document.getElementById('disconnectBtn');
const shareViewerBtn = document.getElementById('shareViewerBtn');
const currentStreamId = document.getElementById('currentStreamId');
const connectionStatus = document.getElementById('connectionStatus');
const streamResolution = document.getElementById('streamResolution');
const debugBtn = document.getElementById('debugBtn');
const debugInfo = document.getElementById('debugInfo');

// Variables
let localStream = null;
let socket = null;
let serverData = null;
let isStreaming = false;
let activeStreamId = null;

// Viewer mode variables
let peerConnection = null;
let currentHostId = null;

// WebRTC configuration
const peerConnectionConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ],
  sdpSemantics: 'unified-plan',
  iceTransportPolicy: 'all',
  bundlePolicy: 'balanced',
  rtcpMuxPolicy: 'require'
};

// Map to store peer connections for host mode
const peerConnections = new Map();

// Show status message
function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.display = 'block';

  if (isError) {
    statusMessage.classList.add('error');
  } else {
    statusMessage.classList.remove('error');
  }

  // Hide after 5 seconds if not an error
  if (!isError) {
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Remove active class from all tabs and contents
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    tab.classList.add('active');
    const tabId = tab.getAttribute('data-tab') + '-tab';
    document.getElementById(tabId).classList.add('active');
  });
});

// Connect to server
async function connectToServer() {
  try {
    // Use environment variable if available, otherwise use input value
    let serverUrl = socketServerUrl || serverUrlInput.value.trim();

    // If environment variable is set, populate the input field
    if (socketServerUrl && !serverUrlInput.value) {
      serverUrlInput.value = socketServerUrl;
    }

    if (!serverUrl) {
      showStatus('Please enter a server URL', true);
      return false;
    }

    showStatus(`Connecting to server at ${serverUrl}...`);

    // Parse the server URL
    const url = new URL(serverUrl);

    // Store server data
    serverData = {
      url: serverUrl,
      ip: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80)
    };

    // Connect to Socket.IO server
    await connectToSignalingServer();

    if (!socket) {
      showStatus('Failed to connect to server', true);
      return false;
    }

    // Update UI
    connectServerBtn.disabled = true;
    disconnectServerBtn.disabled = false;

    showStatus('Connected to server successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to server:', error);
    showStatus(`Error connecting to server: ${error.message}`, true);
    return false;
  }
}

// Disconnect from server
function disconnectFromServer() {
  // Stop streaming if active
  if (isStreaming) {
    stopRemoteStreaming();
  }

  // Stop viewing if active
  if (currentHostId) {
    disconnectFromStream();
  }

  // Disconnect from server
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  // Update UI
  connectServerBtn.disabled = false;
  disconnectServerBtn.disabled = true;

  showStatus('Disconnected from server');
}

// Connect to the signaling server
async function connectToSignalingServer() {
  try {
    // Check if Socket.IO is loaded
    if (typeof io === 'undefined') {
      console.log('Socket.IO not loaded, attempting to load it dynamically');

      // Try to load Socket.IO dynamically
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `${serverData.url}/socket.io/socket.io.js`;
        script.onload = resolve;
        script.onerror = () => {
          // Try CDN as fallback
          const cdnScript = document.createElement('script');
          cdnScript.src = 'https://cdn.socket.io/4.4.1/socket.io.min.js';
          cdnScript.onload = resolve;
          cdnScript.onerror = reject;
          document.head.appendChild(cdnScript);
        };
        document.head.appendChild(script);
      });

      console.log('Socket.IO loaded dynamically');
    }

    // Create Socket.IO connection
    console.log('Connecting to Socket.IO server at:', serverData.url);
    socket = io(serverData.url);

    // Socket.IO event handlers
    socket.on('connect', () => {
      console.log('Connected to signaling server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      if (isStreaming) {
        stopRemoteStreaming();
      }
      if (currentHostId) {
        disconnectFromStream();
      }
    });

    // Receive active streams on connection
    socket.on('active-streams', (streams) => {
      console.log('Received active streams:', streams);
      updateStreamList(streams);
    });

    // New stream added
    socket.on('stream-added', (stream) => {
      console.log('New stream added:', stream);
      addStreamToList(stream);
    });

    // Stream removed
    socket.on('stream-removed', (data) => {
      console.log('Stream removed:', data);

      // If we're connected to this stream, disconnect
      if (activeStreamId === data.id) {
        showStatus('The host has stopped streaming', true);
        disconnectFromStream();
      }

      // Remove the stream from the list
      removeStreamFromList(data.id);
    });

    // Host mode: Stream started confirmation
    socket.on('stream-started', (data) => {
      console.log('Stream started with ID:', data.id);

      // Update UI with stream ID and URL
      activeStreamId = data.id;
      streamId.textContent = data.id;
      viewerUrl.textContent = `${serverData.url}/view/${data.id}`;

      // Update UI
      startStreamingBtn.disabled = true;
      stopStreamingBtn.disabled = false;
      serverInfo.style.display = 'block';

      isStreaming = true;
    });

    // Viewer mode: Receive stream info
    socket.on('stream-info', (stream) => {
      console.log('Received stream info:', stream);
      connectToStream(stream.id, stream.hostId, stream.name);
    });

    // Viewer mode: Stream not found
    socket.on('stream-not-found', (data) => {
      console.log('Stream not found:', data);
      showStatus(`Stream with ID ${data.id} not found`, true);
    });

    // WebRTC signaling for host mode
    socket.on('offer', async (data) => {
      console.log('Received offer from viewer:', data.viewerId);
      await handleOffer(data.offer, data.viewerId);
    });

    socket.on('ice-candidate', async (data) => {
      if (data.viewerId) {
        console.log('Received ICE candidate from viewer:', data.viewerId);
        await handleIceCandidate(data.candidate, data.viewerId);
      }
    });

    // WebRTC signaling for viewer mode
    socket.on('answer', async (data) => {
      console.log('Received answer from host:', data);

      if (peerConnection && data.hostId === currentHostId) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
          showStatus('Connected to stream');
        } catch (error) {
          console.error('Error setting remote description:', error);
          showStatus(`Error connecting: ${error.message}`, true);
        }
      }
    });

    return true;
  } catch (error) {
    console.error('Error connecting to signaling server:', error);
    showStatus(`Error connecting to server: ${error.message}`, true);
    return false;
  }
}

// HOST MODE FUNCTIONS

// Get available screen sources
async function getSources() {
  try {
    getSourcesBtn.disabled = true;
    showStatus('Getting available screens and windows...');

    const sources = await window.electronAPI.getSources();

    if (sources && sources.error) {
      showStatus(`Error: ${sources.message}`, true);
      getSourcesBtn.disabled = false;
      return;
    }

    if (!sources || sources.length === 0) {
      showStatus('No screens or windows found to share', true);
      getSourcesBtn.disabled = false;
      return;
    }

    // Clear previous sources
    sourceList.innerHTML = '';

    // Display each source
    sources.forEach(source => {
      try {
        console.log('Processing source:', source.name);
        const sourceItem = document.createElement('div');
        sourceItem.className = 'source-item';

        const thumbnail = document.createElement('img');
        if (source.thumbnail) {
          try {
            thumbnail.src = source.thumbnail.toDataURL();
          } catch (thumbErr) {
            console.error('Error converting thumbnail to data URL:', thumbErr);
            thumbnail.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
          }
        }

        const name = document.createElement('p');
        name.textContent = source.name || 'Unknown source';
        name.title = source.name || 'Unknown source';

        sourceItem.appendChild(thumbnail);
        sourceItem.appendChild(name);

        // Start streaming when a source is clicked
        sourceItem.addEventListener('click', () => {
          startSharing(source.id);
        });

        sourceList.appendChild(sourceItem);
      } catch (err) {
        console.error('Error processing source:', err);
      }
    });

    showStatus(`Found ${sources.length} screens/windows`);
  } catch (error) {
    console.error('Error getting sources:', error);
    showStatus(`Error getting screens and windows: ${error.message}`, true);
  } finally {
    getSourcesBtn.disabled = false;
  }
}

// Start sharing the selected screen/window
async function startSharing(sourceId) {
  try {
    showStatus('Starting screen sharing...');

    // Create a stream from the selected source
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: sourceId
        }
      }
    };

    console.log('Getting user media with constraints:', JSON.stringify(constraints));
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Got media stream:', stream);

    // Save the local stream for later use with WebRTC
    localStream = stream;

    // Display the stream
    hostVideo.srcObject = stream;

    // Show video container and hide source list
    hostVideoContainer.style.display = 'block';
    sourceList.style.display = 'none';
    getSourcesBtn.style.display = 'none';

    showStatus('Screen sharing started');
  } catch (error) {
    console.error('Error starting stream:', error);
    showStatus(`Error starting screen sharing: ${error.message}`, true);
  }
}

// Stop sharing the screen
function stopSharing() {
  // Stop remote streaming if active
  if (isStreaming) {
    stopRemoteStreaming();
  }

  // Stop all tracks in the stream
  if (localStream) {
    localStream.getTracks().forEach(track => {
      console.log('Stopping track:', track.kind, track.label);
      track.stop();
    });
    localStream = null;
  }

  // Reset UI
  hostVideoContainer.style.display = 'none';
  sourceList.style.display = 'flex';
  getSourcesBtn.style.display = 'inline-block';
  serverInfo.style.display = 'none';

  showStatus('Screen sharing stopped');
}

// Start remote streaming
async function startRemoteStreaming() {
  try {
    // Make sure we're connected to a server
    if (!socket) {
      const connected = await connectToServer();
      if (!connected) return;
    }

    // Get the selected source name
    const sourceName = hostVideo.srcObject.getTracks()[0].label;

    // Notify the server that we're starting a stream
    socket.emit('start-stream', {
      name: sourceName
    });

    showStatus('Starting remote stream...');
  } catch (error) {
    console.error('Error starting remote streaming:', error);
    showStatus(`Error starting remote streaming: ${error.message}`, true);
  }
}

// Stop remote streaming
function stopRemoteStreaming() {
  if (!isStreaming || !socket) return;

  // Notify the server that we're stopping the stream
  socket.emit('stop-stream');

  // Close all peer connections
  closePeerConnections();

  // Update UI
  isStreaming = false;
  activeStreamId = null;
  startStreamingBtn.disabled = false;
  stopStreamingBtn.disabled = true;
  serverInfo.style.display = 'none';

  showStatus('Remote streaming stopped');
}

// Handle offer from viewer
async function handleOffer(offer, viewerId) {
  try {
    console.log('Creating peer connection for viewer:', viewerId);

    // Create a new RTCPeerConnection for this viewer
    const peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnections.set(viewerId, peerConnection);

    // Log connection state changes
    peerConnection.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${viewerId}:`, peerConnection.iceConnectionState);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state for ${viewerId}:`, peerConnection.connectionState);
    };

    // Add local stream tracks to the peer connection
    if (localStream) {
      console.log('Adding tracks from local stream to peer connection');
      localStream.getTracks().forEach(track => {
        console.log('Adding track to peer connection:', track.kind, track.label);
        peerConnection.addTrack(track, localStream);
      });
    } else {
      console.error('No local stream available to share');
      showStatus('No local stream available to share', true);
      return;
    }

    // Set up ICE candidate handling
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          viewerId: viewerId,
          candidate: event.candidate
        });
      }
    };

    // Set the remote description (viewer's offer)
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    // Create an answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send the answer to the viewer
    socket.emit('answer', {
      viewerId: viewerId,
      answer: answer
    });

    console.log('Sent answer to viewer:', viewerId);
  } catch (error) {
    console.error('Error handling offer:', error);
    showStatus(`Error connecting to viewer: ${error.message}`, true);
  }
}

// Handle ICE candidate from viewer
async function handleIceCandidate(candidate, viewerId) {
  try {
    const peerConnection = peerConnections.get(viewerId);
    if (peerConnection) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch (error) {
    console.error('Error handling ICE candidate:', error);
  }
}

// Close all peer connections
function closePeerConnections() {
  for (const [viewerId, peerConnection] of peerConnections.entries()) {
    peerConnection.close();
  }
  peerConnections.clear();
}

// VIEWER MODE FUNCTIONS

// Update the stream list
function updateStreamList(streams) {
  streamList.innerHTML = '';

  if (streams.length === 0) {
    noStreams.style.display = 'block';
    return;
  }

  noStreams.style.display = 'none';

  streams.forEach(stream => {
    addStreamToList(stream);
  });
}

// Add a stream to the list
function addStreamToList(stream) {
  const streamItem = document.createElement('div');
  streamItem.className = 'stream-item';
  streamItem.dataset.id = stream.id;

  const title = document.createElement('h3');
  title.textContent = stream.name || 'Unnamed Stream';

  const id = document.createElement('p');
  id.textContent = `ID: ${stream.id}`;

  const time = document.createElement('p');
  const createdAt = new Date(stream.createdAt);
  time.textContent = `Started: ${createdAt.toLocaleTimeString()}`;

  streamItem.appendChild(title);
  streamItem.appendChild(id);
  streamItem.appendChild(time);

  streamItem.addEventListener('click', () => {
    connectToStream(stream.id, stream.hostId, stream.name);
  });

  streamList.appendChild(streamItem);
  noStreams.style.display = 'none';
}

// Remove a stream from the list
function removeStreamFromList(streamId) {
  const streamItems = streamList.querySelectorAll('.stream-item');
  let streamsLeft = false;

  streamItems.forEach(item => {
    if (item.dataset.id === streamId) {
      streamList.removeChild(item);
    } else {
      streamsLeft = true;
    }
  });

  if (!streamsLeft) {
    noStreams.style.display = 'block';
  }
}

// Connect to a stream by ID
async function connectToStreamById(streamId) {
  if (!socket) {
    const connected = await connectToServer();
    if (!connected) return;
  }

  socket.emit('get-stream', streamId);
  showStatus(`Requesting stream info for ID: ${streamId}...`);
}

// Connect to a stream
async function connectToStream(streamId, hostId, streamName) {
  try {
    // If we don't have the host ID, request stream info
    if (!hostId) {
      connectToStreamById(streamId);
      return;
    }

    showStatus(`Connecting to stream: ${streamName || streamId}...`);

    // Save the host ID and stream ID
    currentHostId = hostId;
    activeStreamId = streamId;
    currentStreamId.textContent = streamId;

    // Update UI
    streamTitle.textContent = `Viewing: ${streamName || 'Stream ' + streamId}`;
    streamSelection.style.display = 'none';
    viewerVideoContainer.style.display = 'block';
    connectionStatus.textContent = 'Connecting...';

    // Create a new RTCPeerConnection
    console.log('Creating peer connection with config:', peerConnectionConfig);
    peerConnection = new RTCPeerConnection(peerConnectionConfig);

    // Set up event handlers for the peer connection
    peerConnection.onicecandidate = event => {
      console.log('ICE candidate:', event.candidate);
      if (event.candidate) {
        socket.emit('ice-candidate', {
          hostId: currentHostId,
          candidate: event.candidate
        });
      }
    };

    peerConnection.ontrack = event => {
      console.log('Received remote track:', event.streams[0]);
      connectionStatus.textContent = 'Track received';

      // Set the remote video source
      remoteVideo.srcObject = event.streams[0];

      // Add event listener to detect when video starts playing
      remoteVideo.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        connectionStatus.textContent = 'Video playing';
        streamResolution.textContent = `${remoteVideo.videoWidth}x${remoteVideo.videoHeight}`;
      };

      // Add event listener for video playing
      remoteVideo.onplaying = () => {
        console.log('Video is now playing');
        connectionStatus.textContent = 'Video playing';
      };

      // Add event listener for errors
      remoteVideo.onerror = (error) => {
        console.error('Video error:', error);
        connectionStatus.textContent = `Error: ${error.message || 'Unknown error'}`;
      };
    };

    peerConnection.oniceconnectionstatechange = () => {
      const state = peerConnection.iceConnectionState;
      console.log('ICE connection state:', state);
      connectionStatus.textContent = `ICE: ${state}`;

      if (state === 'connected' || state === 'completed') {
        showStatus('Connected to remote stream');
      } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        showStatus('Connection lost. Please try reconnecting.', true);
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log('Connection state:', state);

      if (state === 'connected') {
        showStatus('Connected to remote stream');
      }
    };

    // Create and send an offer with specific constraints
    console.log('Creating offer with specific constraints');
    const offerOptions = {
      offerToReceiveAudio: false,
      offerToReceiveVideo: true
    };

    try {
      // Create the offer
      const offer = await peerConnection.createOffer(offerOptions);

      // Log the original SDP for debugging
      console.log('Original offer SDP:', offer.sdp);

      // Set the local description
      console.log('Setting local description');
      await peerConnection.setLocalDescription(offer);

      // Send the offer to the host
      console.log('Sending offer to host');
      socket.emit('offer', {
        hostId: currentHostId,
        streamId: streamId,
        offer: offer
      });
    } catch (offerError) {
      console.error('Error creating/setting offer:', offerError);
      showStatus(`Error creating offer: ${offerError.message}`, true);
      throw offerError; // Re-throw to be caught by the outer try/catch
    }

    showStatus('Offer sent, waiting for answer...');
  } catch (error) {
    console.error('Error connecting to stream:', error);
    showStatus(`Error connecting to stream: ${error.message}`, true);
    disconnectFromStream();
  }
}

// Disconnect from the current stream
function disconnectFromStream() {
  // Close the peer connection
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }

  // Reset video
  remoteVideo.srcObject = null;

  // Update UI
  viewerVideoContainer.style.display = 'none';
  streamSelection.style.display = 'block';
  currentHostId = null;
  activeStreamId = null;
  currentStreamId.textContent = 'None';
  connectionStatus.textContent = 'Not connected';
  streamResolution.textContent = 'Unknown';

  showStatus('Disconnected from stream');
}

// EVENT LISTENERS

// Connect server button
connectServerBtn.addEventListener('click', async () => {
  await connectToServer();
});

// Disconnect server button
disconnectServerBtn.addEventListener('click', () => {
  disconnectFromServer();
});

// Get sources button
getSourcesBtn.addEventListener('click', () => {
  getSources();
});

// Stop sharing button
stopSharingBtn.addEventListener('click', () => {
  stopSharing();
});

// Start streaming button
startStreamingBtn.addEventListener('click', () => {
  startRemoteStreaming();
});

// Stop streaming button
stopStreamingBtn.addEventListener('click', () => {
  stopRemoteStreaming();
});

// Open viewer button
openViewerBtn.addEventListener('click', () => {
  const url = viewerUrl.textContent;
  if (url && url !== 'Waiting for server...') {
    window.electronAPI.openExternal(url);
  }
});

// Copy URL button
copyUrlBtn.addEventListener('click', () => {
  const url = viewerUrl.textContent;
  if (url && url !== 'Waiting for server...') {
    navigator.clipboard.writeText(url)
      .then(() => {
        showStatus('URL copied to clipboard');
      })
      .catch(err => {
        console.error('Error copying URL:', err);
        showStatus('Error copying URL', true);
      });
  }
});

// Copy ID button
copyIdBtn.addEventListener('click', () => {
  const id = streamId.textContent;
  if (id && id !== 'Waiting for server...') {
    navigator.clipboard.writeText(id)
      .then(() => {
        showStatus('Stream ID copied to clipboard');
      })
      .catch(err => {
        console.error('Error copying ID:', err);
        showStatus('Error copying ID', true);
      });
  }
});

// Connect to stream button
connectToStreamBtn.addEventListener('click', () => {
  const id = streamIdInput.value.trim();
  if (id) {
    connectToStreamById(id);
  } else {
    showStatus('Please enter a stream ID', true);
  }
});

// Disconnect button
disconnectBtn.addEventListener('click', () => {
  disconnectFromStream();
});

// Share viewer button
shareViewerBtn.addEventListener('click', () => {
  if (activeStreamId) {
    const shareUrl = `${serverData.url}/view/${activeStreamId}`;

    // Try to use the clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          showStatus('Stream URL copied to clipboard');
        })
        .catch(err => {
          console.error('Error copying to clipboard:', err);
          showStatus('Error copying URL', true);
        });
    }
  }
});

// Debug button
debugBtn.addEventListener('click', () => {
  if (debugInfo.style.display === 'none' || !debugInfo.style.display) {
    let info = 'Debug Information:\n';

    if (peerConnection) {
      info += `\nICE Connection State: ${peerConnection.iceConnectionState}`;
      info += `\nConnection State: ${peerConnection.connectionState}`;
      info += `\nSignaling State: ${peerConnection.signalingState}`;

      const stats = peerConnection.getStats();
      stats.then(statsReport => {
        let statsInfo = '\n\nConnection Stats:\n';
        statsReport.forEach(report => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            statsInfo += `\nResolution: ${report.frameWidth}x${report.frameHeight}`;
            statsInfo += `\nFrames Received: ${report.framesReceived}`;
            statsInfo += `\nFrames Decoded: ${report.framesDecoded}`;
            statsInfo += `\nFrames Dropped: ${report.framesDropped}`;
            statsInfo += `\nPackets Lost: ${report.packetsLost}`;
            statsInfo += `\nJitter: ${report.jitter}`;
          }
        });
        debugInfo.textContent = info + statsInfo;
      });
    } else {
      debugInfo.textContent = 'No active connection';
    }

    debugInfo.style.display = 'block';
    debugBtn.textContent = 'Hide Debug Info';
  } else {
    debugInfo.style.display = 'none';
    debugBtn.textContent = 'Show Debug Info';
  }
});

// Check for stream ID in URL query parameters
function checkUrlForStreamId() {
  const urlParams = new URLSearchParams(window.location.search);
  const streamId = urlParams.get('streamId');

  if (streamId) {
    // Switch to viewer tab
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));

    document.querySelector('[data-tab="viewer"]').classList.add('active');
    document.getElementById('viewer-tab').classList.add('active');

    // Set the stream ID input
    streamIdInput.value = streamId;

    // Connect to the stream after a short delay
    setTimeout(() => {
      connectToStreamById(streamId);
    }, 1000);
  }
}

// Initialize
checkUrlForStreamId();
