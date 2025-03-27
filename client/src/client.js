// DOM elements - Common
const serverUrlInput = document.getElementById('serverUrl');
const connectServerBtn = document.getElementById('connectServerBtn');
const disconnectServerBtn = document.getElementById('disconnectServerBtn');
const statusMessage = document.getElementById('statusMessage');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Debug console elements
const debugConsole = document.getElementById('debugConsole');
const toggleDebugBtn = document.getElementById('toggleDebugBtn');
const clearDebugBtn = document.getElementById('clearDebugBtn');
const debugConsoleContainer = document.querySelector('.debug-console-container');

// Load environment variables if available
const socketServerUrl = window.electron?.env?.SOCKET_SERVER_URL || '';

// Debug environment variables
console.log('Environment variables loaded:', {
  socketServerUrl
});

// Try to get environment variables directly
if (window.electron?.getEnv) {
  const envVars = window.electron.getEnv();
  console.log('Environment variables from getEnv:', envVars);
}

// Debug console functions have been replaced by console overrides

// Store original console methods
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Flag to prevent infinite recursion
let isLogging = false;

// Override console methods to also log to debug console
console.log = function() {
  if (isLogging) {
    // If we're already logging, just use the original method
    originalConsoleLog.apply(console, arguments);
    return;
  }

  isLogging = true;
  try {
    // Call the original method
    originalConsoleLog.apply(console, arguments);

    // Add to debug console
    const formattedArgs = Array.from(arguments).map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Object cannot be stringified]';
        }
      }
      return String(arg);
    }).join(' ');

    // Add to debug console without calling console.log again
    const logEntry = document.createElement('div');
    logEntry.classList.add('debug-log');
    const timestamp = new Date().toISOString();
    logEntry.textContent = `[${timestamp}] ${formattedArgs}`;
    debugConsole.appendChild(logEntry);
    debugConsole.scrollTop = debugConsole.scrollHeight;
  } finally {
    isLogging = false;
  }
};

console.info = function() {
  if (isLogging) {
    // If we're already logging, just use the original method
    originalConsoleInfo.apply(console, arguments);
    return;
  }

  isLogging = true;
  try {
    // Call the original method
    originalConsoleInfo.apply(console, arguments);

    // Add to debug console
    const formattedArgs = Array.from(arguments).map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Object cannot be stringified]';
        }
      }
      return String(arg);
    }).join(' ');

    // Add to debug console without calling console.info again
    const logEntry = document.createElement('div');
    logEntry.classList.add('debug-log', 'debug-info');
    const timestamp = new Date().toISOString();
    logEntry.textContent = `[${timestamp}] INFO: ${formattedArgs}`;
    debugConsole.appendChild(logEntry);
    debugConsole.scrollTop = debugConsole.scrollHeight;
  } finally {
    isLogging = false;
  }
};

console.warn = function() {
  if (isLogging) {
    // If we're already logging, just use the original method
    originalConsoleWarn.apply(console, arguments);
    return;
  }

  isLogging = true;
  try {
    // Call the original method
    originalConsoleWarn.apply(console, arguments);

    // Add to debug console
    const formattedArgs = Array.from(arguments).map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Object cannot be stringified]';
        }
      }
      return String(arg);
    }).join(' ');

    // Add to debug console without calling console.warn again
    const logEntry = document.createElement('div');
    logEntry.classList.add('debug-log', 'debug-warn');
    const timestamp = new Date().toISOString();
    logEntry.textContent = `[${timestamp}] WARNING: ${formattedArgs}`;
    debugConsole.appendChild(logEntry);
    debugConsole.scrollTop = debugConsole.scrollHeight;
  } finally {
    isLogging = false;
  }
};

console.error = function() {
  if (isLogging) {
    // If we're already logging, just use the original method
    originalConsoleError.apply(console, arguments);
    return;
  }

  isLogging = true;
  try {
    // Call the original method
    originalConsoleError.apply(console, arguments);

    // Add to debug console
    const formattedArgs = Array.from(arguments).map(arg => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return '[Object cannot be stringified]';
        }
      }
      return String(arg);
    }).join(' ');

    // Add to debug console without calling console.error again
    const logEntry = document.createElement('div');
    logEntry.classList.add('debug-log', 'debug-error');
    const timestamp = new Date().toISOString();
    logEntry.textContent = `[${timestamp}] ERROR: ${formattedArgs}`;
    debugConsole.appendChild(logEntry);
    debugConsole.scrollTop = debugConsole.scrollHeight;
  } finally {
    isLogging = false;
  }
};

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
const requestRemoteControlBtn = document.getElementById('requestRemoteControlBtn');
const stopRemoteControlBtn = document.getElementById('stopRemoteControlBtn');
const currentStreamId = document.getElementById('currentStreamId');
const connectionStatus = document.getElementById('connectionStatus');
const streamResolution = document.getElementById('streamResolution');
const debugBtn = document.getElementById('debugBtn');
const debugInfoElement = document.getElementById('debugInfo');

// Variables
let localStream = null;
let socket = null;
let serverData = null;
let isStreaming = false;
let activeStreamId = null;
let isDirectConnection = false; // Flag for direct connection vs. ngrok
let isRemoteControlActive = false; // Flag for remote control status
let remoteControlViewerId = null; // ID of the viewer with remote control

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
    console.error('Status:', message);
  } else {
    statusMessage.classList.remove('error');
    console.info('Status:', message);
  }

  // For important messages, make them more visible
  if (message.includes('Connected') || message.includes('Error') || message.includes('Failed')) {
    statusMessage.style.fontWeight = 'bold';
  } else {
    statusMessage.style.fontWeight = 'normal';
  }

  // Fade after 5 seconds if not an error
  if (!isError) {
    setTimeout(() => {
      if (statusMessage.textContent === message) {
        statusMessage.style.opacity = '0.7';

        // Hide after 10 seconds
        setTimeout(() => {
          if (statusMessage.textContent === message) {
            statusMessage.style.display = 'none';
            statusMessage.style.opacity = '1';
          }
        }, 5000);
      }
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

    // Set the direct connection flag for local testing
    isDirectConnection = serverUrl.includes('localhost') || serverUrl.includes('127.0.0.1');
    console.info('Using direct connection:', isDirectConnection);

    if (!serverUrl) {
      showStatus('Please enter a server URL', true);
      return false;
    }

    showStatus(`Connecting to server at ${serverUrl}...`);

    try {
      // Parse the server URL
      const url = new URL(serverUrl);

      // Store server data
      serverData = {
        url: serverUrl,
        ip: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80)
      };
    } catch (urlError) {
      console.error('Invalid server URL:', urlError);
      showStatus(`Invalid server URL: ${urlError.message}`, true);
      return false;
    }

    // Connect to Socket.IO server
    try {
      await connectToSignalingServer();
    } catch (socketError) {
      console.error('Socket connection error:', socketError);
      showStatus(`Socket connection error: ${socketError.message}`, true);
      return false;
    }

    if (!socket) {
      showStatus('Failed to create socket connection', true);
      return false;
    }

    if (!socket.connected) {
      showStatus('Socket created but not connected', true);
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
    console.info('Connecting to signaling server with serverData:', serverData);

    // Check if Socket.IO is loaded
    if (typeof io === 'undefined') {
      console.error('Socket.IO not loaded. Attempting to load it dynamically.');
      showStatus('Loading Socket.IO library...', false);

      // Try to load Socket.IO dynamically
      try {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.socket.io/4.8.1/socket.io.min.js';
          script.onload = () => {
            console.info('Socket.IO loaded dynamically');
            resolve();
          };
          script.onerror = (error) => {
            console.error('Failed to load Socket.IO from primary CDN:', error);
            console.warn('Trying alternative CDN...');

            // Try an alternative CDN
            const altScript = document.createElement('script');
            altScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.8.1/socket.io.min.js';
            altScript.onload = () => {
              console.info('Socket.IO loaded from alternative CDN');
              resolve();
            };
            altScript.onerror = (altError) => {
              console.error('Failed to load Socket.IO from alternative CDN:', altError);
              console.warn('Trying to load from server...');

              // Try to load from the server as a last resort
              const serverScript = document.createElement('script');
              serverScript.src = `${serverData.url}/socket.io/socket.io.js`;
              serverScript.onload = () => {
                console.info('Socket.IO loaded from server');
                resolve();
              };
              serverScript.onerror = (serverError) => {
                console.error('Failed to load Socket.IO from server:', serverError);
                reject(new Error('Failed to load Socket.IO from all sources'));
              };
              document.head.appendChild(serverScript);
            };
            document.head.appendChild(altScript);
          };
          document.head.appendChild(script);

          // Set a timeout
          setTimeout(() => {
            if (typeof io === 'undefined') {
              reject(new Error('Socket.IO load timeout'));
            }
          }, 5000);
        });
      } catch (loadError) {
        console.error('Error loading Socket.IO:', loadError);
        showStatus('Error: Failed to load Socket.IO. Please refresh the page.', true);
        return false;
      }

      // Double-check that Socket.IO is now loaded
      if (typeof io === 'undefined') {
        console.error('Socket.IO still not loaded after dynamic loading attempt.');
        showStatus('Error: Socket.IO not loaded. Please refresh the page.', true);
        return false;
      }
    }

    // Create Socket.IO connection
    console.info('Connecting to Socket.IO server at:', serverData.url);

    // Add connection options for better reliability
    try {
      // Close existing socket if it exists
      if (socket) {
        console.info('Closing existing socket connection');
        socket.disconnect();
        socket = null;
      }

      // Verify serverData is available
      if (!serverData || !serverData.url) {
        console.error('Server data is missing or invalid');
        showStatus('Error: Server data is missing or invalid', true);
        return false;
      }

      // Create socket connection with settings based on connection type
      const connectionOptions = {
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        autoConnect: true,
        secure: serverData.url.startsWith('https')
      };

      // Log server data and connection type
      console.info('Server data:', serverData);
      console.info('Connection type:', isDirectConnection ? 'Direct' : 'Ngrok');

      // Add specific options based on connection type
      if (isDirectConnection) {
        // Direct connection (localhost) - use both transports
        console.info('Using direct connection options');
        connectionOptions.transports = ['polling', 'websocket'];
      } else {
        // Ngrok connection - use only polling and add extra options
        console.info('Using ngrok connection options');
        connectionOptions.transports = ['polling'];
        connectionOptions.forceBase64 = true;
        connectionOptions.upgrade = false;
        connectionOptions.extraHeaders = {
          'ngrok-skip-browser-warning': 'true'
        };
      }

      // Check again if Socket.IO is loaded (it might have loaded asynchronously)
      if (typeof io === 'undefined') {
        console.warn('Socket.IO still not available, waiting for it to load...');

        // Wait for Socket.IO to be available
        await new Promise((resolve, reject) => {
          const checkInterval = setInterval(() => {
            if (typeof io !== 'undefined') {
              clearInterval(checkInterval);
              clearTimeout(timeoutId);
              console.info('Socket.IO is now available');
              resolve();
            }
          }, 100);

          // Set a timeout
          const timeoutId = setTimeout(() => {
            clearInterval(checkInterval);
            reject(new Error('Timed out waiting for Socket.IO to load'));
          }, 10000);
        });
      }

      // Create the socket connection
      try {
        console.info('Creating Socket.IO instance with URL:', serverData.url);
        console.info('Connection options:', connectionOptions);

        socket = io(serverData.url, connectionOptions);

        if (!socket) {
          throw new Error('Failed to create Socket.IO instance');
        }

        console.info('Socket.IO instance created successfully');
      } catch (socketError) {
        console.error('Error creating Socket.IO instance:', socketError);
        showStatus(`Error creating Socket.IO instance: ${socketError.message}`, true);
        return false;
      }

      console.info('Socket.IO instance created');

      // Wait for connection to be established
      await new Promise((resolve, reject) => {
        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          console.warn('Connection attempt timed out, but still waiting...');

          // Set a final timeout
          setTimeout(() => {
            if (!socket.connected) {
              reject(new Error('Connection timeout after extended wait'));
            }
          }, 10000); // Give it 10 more seconds
        }, 10000); // Initial 10 second timeout

        // Handle successful connection
        socket.on('connect', () => {
          console.info('Socket connected successfully with ID:', socket.id);
          clearTimeout(connectionTimeout);
          resolve();
        });

        // Handle connection error
        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);

          // Check for parser error
          if (error && error.code === 'parser error') {
            console.warn('Parser error detected, trying to reconnect...');

            // Try to reconnect with different settings
            socket.io.opts.transports = ['polling'];
            socket.io.opts.forceBase64 = true; // Force base64 encoding
            socket.io.opts.upgrade = false; // Disable upgrades

            // Manually reconnect
            socket.disconnect().connect();
          }

          // Don't reject immediately on first error with ngrok
          // Let the timeout handle it if it persists
        });

        // Handle transport error
        socket.io.on('error', (error) => {
          console.error('Transport error:', error);

          // Check for parser error
          if (error && error.code === 'parser error') {
            console.warn('Transport parser error detected, trying to reconnect...');

            // Try to reconnect with different settings
            socket.io.opts.transports = ['polling'];
            socket.io.opts.forceBase64 = true; // Force base64 encoding
            socket.io.opts.upgrade = false; // Disable upgrades

            // Manually reconnect
            socket.disconnect().connect();
          }

          // Don't reject immediately on first error with ngrok
          // Let the timeout handle it if it persists
        });

        // Handle reconnect attempt
        socket.io.on('reconnect_attempt', (attempt) => {
          console.info('Reconnection attempt:', attempt);
        });

        // Handle reconnect
        socket.on('reconnect', (attempt) => {
          console.info('Socket reconnected after', attempt, 'attempts');
          clearTimeout(connectionTimeout);
          resolve();
        });

        // Remote control events

        // Host: Remote control request from viewer
        socket.on('remote-control-requested', (data) => {
          console.info('Remote control requested by viewer:', data.viewerId);

          // Show confirmation dialog
          const confirmed = confirm('A viewer has requested remote control of your screen. Allow?');

          // Send response to server
          socket.emit('remote-control-response', {
            streamId: data.streamId,
            viewerId: data.viewerId,
            accepted: confirmed
          });
        });

        // Host: Remote control started
        socket.on('remote-control-started', (data) => {
          console.info('Remote control started for viewer:', data.viewerId);

          // Update state
          isRemoteControlActive = true;
          remoteControlViewerId = data.viewerId;

          // Update UI
          showStatus('Remote control active - press ESC to stop');

          // Add event listeners for keyboard and mouse events
          setupRemoteControlListeners();
        });

        // Host: Remote control event from viewer
        socket.on('remote-control-event', async (data) => {
          if (isRemoteControlActive) {
            await handleRemoteControlEvent(data.eventType, data.eventData);
          }
        });

        // Both: Remote control ended
        socket.on('remote-control-ended', (data) => {
          console.info('Remote control ended for stream:', data.streamId);

          // Update state
          isRemoteControlActive = false;
          remoteControlViewerId = null;

          // Update UI
          showStatus('Remote control ended');

          // Remove event listeners
          removeRemoteControlListeners();
        });

        // Viewer: Remote control request response
        socket.on('remote-control-request-sent', (data) => {
          console.info('Remote control request sent for stream:', data.streamId);
          showStatus('Remote control request sent to host...');
        });

        // Viewer: Remote control accepted
        socket.on('remote-control-accepted', (data) => {
          console.info('Remote control accepted for stream:', data.streamId);

          // Update state
          isRemoteControlActive = true;

          // Update UI
          showStatus('Remote control active - click on the video to control');

          // Add event listeners to the video element
          setupViewerRemoteControlListeners();
        });

        // Viewer: Remote control rejected
        socket.on('remote-control-rejected', (data) => {
          console.info('Remote control rejected for stream:', data.streamId);
          showStatus('Remote control request rejected by host', true);
        });

        // Both: Remote control error
        socket.on('remote-control-error', (data) => {
          console.error('Remote control error:', data.error);
          showStatus(`Remote control error: ${data.error}`, true);

          // Reset state
          isRemoteControlActive = false;
          remoteControlViewerId = null;

          // Remove event listeners
          if (isStreaming) {
            removeRemoteControlListeners();
          } else {
            removeViewerRemoteControlListeners();
          }
        });

        // Both: Remote control stopped confirmation
        socket.on('remote-control-stopped', (data) => {
          console.info('Remote control stopped for stream:', data.streamId);

          // Update state
          isRemoteControlActive = false;
          remoteControlViewerId = null;

          // Update UI
          showStatus('Remote control stopped');
        });
      });

      console.info('Socket.IO connection established or in progress');
    } catch (socketError) {
      console.error('Error creating Socket.IO instance:', socketError);
      throw socketError;
    }

    // Socket.IO event handlers
    socket.on('connect', () => {
      console.info('Connected to signaling server');
      console.info('Socket ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      showStatus(`Connection error: ${error.message}`, true);
    });

    socket.on('connect_timeout', (timeout) => {
      console.error('Socket connection timeout:', timeout);
      showStatus('Connection timeout', true);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      showStatus(`Socket error: ${error.message || 'Unknown error'}`, true);
    });

    socket.on('disconnect', (reason) => {
      console.warn('Disconnected from signaling server. Reason:', reason);
      if (isStreaming) {
        console.info('Stopping remote streaming due to disconnect');
        stopRemoteStreaming();
      }
      if (currentHostId) {
        console.info('Disconnecting from stream due to server disconnect');
        disconnectFromStream();
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.info('Reconnected to signaling server after', attemptNumber, 'attempts');
      showStatus('Reconnected to server');
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.info('Attempting to reconnect to server, attempt', attemptNumber);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Error reconnecting to server:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect to server after multiple attempts');
      showStatus('Failed to reconnect to server. Please try again.', true);
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
      console.info('Stream started event received with data:', data);

      try {
        if (!data) {
          console.error('Null or undefined stream data received');
          showStatus('Error: No stream data received from server', true);
          return;
        }

        if (!data.id) {
          console.error('Invalid stream data received (missing ID):', data);
          showStatus('Error: Invalid stream data received from server (missing ID)', true);
          return;
        }

        console.info('Stream started successfully with ID:', data.id);

        // Update UI with stream ID and URL
        activeStreamId = data.id;
        streamId.textContent = data.id;

        // Use ngrok URL if available, otherwise use server URL
        const viewerUrlBase = serverData.url;
        const fullViewerUrl = `${viewerUrlBase}/view/${data.id}`;
        viewerUrl.textContent = fullViewerUrl;

        console.info('Viewer URL set to:', fullViewerUrl);

        // Update UI
        startStreamingBtn.disabled = true;
        stopStreamingBtn.disabled = false;
        serverInfo.style.display = 'block';

        isStreaming = true;

        // Copy stream ID to clipboard for convenience
        try {
          navigator.clipboard.writeText(data.id).then(() => {
            console.info('Stream ID copied to clipboard');
          }).catch(err => {
            console.warn('Could not copy stream ID to clipboard:', err);
          });
        } catch (clipboardError) {
          console.warn('Clipboard API not available:', clipboardError);
        }

        showStatus(`Stream started with ID: ${data.id}`);
      } catch (streamError) {
        console.error('Error processing stream-started event:', streamError);
        showStatus(`Error processing stream data: ${streamError.message}`, true);
      }
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

    // Handle stream errors
    socket.on('stream-error', (data) => {
      console.error('Stream error received:', data);
      showStatus(`Stream error: ${data.error}. ${data.details || ''}`, true);
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
    console.info('Getting available screens and windows...');
    getSourcesBtn.disabled = true;
    showStatus('Getting available screens and windows...');

    // Check if electronAPI is available
    if (!window.electronAPI) {
      console.error('electronAPI is not available');
      showStatus('Error: electronAPI is not available', true);
      getSourcesBtn.disabled = false;
      return;
    }

    // Check if getSources method is available
    if (!window.electronAPI.getSources) {
      console.error('electronAPI.getSources method is not available');
      showStatus('Error: getSources method is not available', true);
      getSourcesBtn.disabled = false;
      return;
    }

    console.info('Calling window.electronAPI.getSources()...');
    const sources = await window.electronAPI.getSources();
    console.info('getSources response received:', sources);

    if (sources && sources.error) {
      console.error('Error from getSources:', sources);
      showStatus(`Error: ${sources.message}`, true);
      getSourcesBtn.disabled = false;
      return;
    }

    if (!sources || sources.length === 0) {
      console.warn('No sources found');
      showStatus('No screens or windows found to share', true);
      getSourcesBtn.disabled = false;
      return;
    }

    console.info(`Found ${sources.length} sources`);

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
    console.info('Starting screen sharing with sourceId:', sourceId);
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

    console.info('Getting user media with constraints:', JSON.stringify(constraints));

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.info('Got media stream:', {
      id: stream.id,
      active: stream.active,
      trackCount: stream.getTracks().length
    });

    // Log track information
    stream.getTracks().forEach((track, index) => {
      console.info(`Track ${index + 1}:`, {
        kind: track.kind,
        id: track.id,
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState
      });
    });

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
    console.info('Starting remote streaming...');

    // Make sure we're connected to a server
    if (!socket) {
      console.warn('No socket connection, attempting to connect to server...');
      const connected = await connectToServer();
      if (!connected) {
        console.error('Failed to connect to server');
        showStatus('Failed to connect to server', true);
        return;
      }
    }

    // Check socket connection state
    if (!socket || !socket.connected) {
      console.warn('Socket not connected, attempting to connect to server...');
      try {
        // Create a new connection to the server
        const connected = await connectToServer();
        if (!connected) {
          console.error('Failed to connect to server');
          showStatus('Failed to connect to server. Please check the server URL and try again.', true);
          return;
        }
      } catch (connectionError) {
        console.error('Error connecting to server:', connectionError);
        showStatus(`Error connecting to server: ${connectionError.message}`, true);
        return;
      }
    }

    // Double-check that socket is connected before proceeding
    if (!socket || !socket.connected) {
      console.error('Socket still not connected after connection attempt');
      showStatus('Failed to establish server connection. Please try again.', true);
      return;
    }

    console.info('Socket connection verified, socket ID:', socket.id);

    // Get the selected source name
    if (!hostVideo.srcObject || !hostVideo.srcObject.getTracks || !hostVideo.srcObject.getTracks().length) {
      console.error('No video source selected or invalid source');
      showStatus('Error: No video source selected', true);
      return;
    }

    const sourceName = hostVideo.srcObject.getTracks()[0].label;
    console.info('Starting stream with source:', sourceName);

    // Create a unique stream ID to help with debugging
    const streamData = {
      name: sourceName,
      clientId: socket.id,
      timestamp: new Date().toISOString(),
      // Add a random component to help with debugging
      debug: Math.random().toString(36).substring(2, 15)
    };

    console.info('Emitting start-stream event with data:', streamData);

    // Reset active stream ID before starting new stream
    activeStreamId = null;

    // Notify the server that we're starting a stream
    socket.emit('start-stream', streamData);

    // Set a timeout to check if we received a stream ID
    const streamIdCheckTimeout = setTimeout(() => {
      if (!activeStreamId) {
        console.warn('No stream ID received after 5 seconds');
        showStatus('Warning: No stream ID received yet. Check server connection.', true);

        // Try to emit the event again
        console.info('Retrying start-stream event...');
        socket.emit('start-stream', {
          ...streamData,
          retry: true,
          retryTime: new Date().toISOString()
        });

        // Set another timeout for the retry
        setTimeout(() => {
          if (!activeStreamId) {
            console.error('Still no stream ID received after retry');
            showStatus('Error: Failed to start stream. Please try again.', true);
          }
        }, 5000);
      } else {
        console.info('Stream ID received successfully:', activeStreamId);
      }
    }, 5000);

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

// Request remote control button
requestRemoteControlBtn.addEventListener('click', () => {
  requestRemoteControl();
  requestRemoteControlBtn.style.display = 'none';
  stopRemoteControlBtn.style.display = 'inline-block';
});

// Stop remote control button
stopRemoteControlBtn.addEventListener('click', () => {
  stopRemoteControl();
  stopRemoteControlBtn.style.display = 'none';
  requestRemoteControlBtn.style.display = 'inline-block';
});

// Debug button
debugBtn.addEventListener('click', () => {
  if (debugInfoElement.style.display === 'none' || !debugInfoElement.style.display) {
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
        debugInfoElement.textContent = info + statsInfo;
      });
    } else {
      debugInfoElement.textContent = 'No active connection';
    }

    debugInfoElement.style.display = 'block';
    debugBtn.textContent = 'Hide Debug Info';
  } else {
    debugInfoElement.style.display = 'none';
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

// Set up debug console
toggleDebugBtn.addEventListener('click', () => {
  if (debugConsoleContainer.style.display === 'block') {
    debugConsoleContainer.style.display = 'none';
    toggleDebugBtn.textContent = 'Show Debug';
  } else {
    debugConsoleContainer.style.display = 'block';
    toggleDebugBtn.textContent = 'Hide Debug';
  }
});

clearDebugBtn.addEventListener('click', () => {
  debugConsole.innerHTML = '';
  console.log('Debug console cleared');
});

// Open DevTools button
const openDevToolsBtn = document.getElementById('openDevToolsBtn');
if (openDevToolsBtn) {
  openDevToolsBtn.addEventListener('click', () => {
    console.info('Opening DevTools...');
    if (window.electronAPI && window.electronAPI.openDevTools) {
      window.electronAPI.openDevTools();
    } else {
      console.error('openDevTools API not available');
      showStatus('Error: DevTools API not available', true);
    }
  });
}

// Show debug console by default
debugConsoleContainer.style.display = 'block';
console.log('Debug console initialized');

// Remote Control Functions

// Host: Set up remote control listeners
function setupRemoteControlListeners() {
  // Add keyboard event listener
  document.addEventListener('keydown', handleHostKeyDown);

  // Add mouse event listeners if we have a local stream video element
  if (hostVideo) {
    hostVideo.addEventListener('mousedown', handleHostMouseDown);
    hostVideo.addEventListener('mouseup', handleHostMouseUp);
    hostVideo.addEventListener('mousemove', handleHostMouseMove);
    hostVideo.addEventListener('wheel', handleHostWheel);
    hostVideo.addEventListener('contextmenu', handleHostContextMenu);
  }
}

// Host: Remove remote control listeners
function removeRemoteControlListeners() {
  document.removeEventListener('keydown', handleHostKeyDown);

  if (hostVideo) {
    hostVideo.removeEventListener('mousedown', handleHostMouseDown);
    hostVideo.removeEventListener('mouseup', handleHostMouseUp);
    hostVideo.removeEventListener('mousemove', handleHostMouseMove);
    hostVideo.removeEventListener('wheel', handleHostWheel);
    hostVideo.removeEventListener('contextmenu', handleHostContextMenu);
  }
}

// Host: Handle keyboard events
function handleHostKeyDown(event) {
  if (isRemoteControlActive) {
    // Check for ESC key to stop remote control
    if (event.key === 'Escape') {
      stopRemoteControl();
      return;
    }

    // Forward the key event to the server
    socket.emit('remote-control-event', {
      streamId: activeStreamId,
      eventType: 'keydown',
      eventData: {
        key: event.key,
        code: event.code,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      }
    });
  }
}

// Host: Handle mouse events
function handleHostMouseDown(event) {
  if (isRemoteControlActive) {
    const rect = hostVideo.getBoundingClientRect();
    const scaleX = hostVideo.videoWidth / rect.width;
    const scaleY = hostVideo.videoHeight / rect.height;

    socket.emit('remote-control-event', {
      streamId: activeStreamId,
      eventType: 'mousedown',
      eventData: {
        button: event.button,
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    });
  }
}

function handleHostMouseUp(event) {
  if (isRemoteControlActive) {
    const rect = hostVideo.getBoundingClientRect();
    const scaleX = hostVideo.videoWidth / rect.width;
    const scaleY = hostVideo.videoHeight / rect.height;

    socket.emit('remote-control-event', {
      streamId: activeStreamId,
      eventType: 'mouseup',
      eventData: {
        button: event.button,
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    });
  }
}

function handleHostMouseMove(event) {
  if (isRemoteControlActive) {
    const rect = hostVideo.getBoundingClientRect();
    const scaleX = hostVideo.videoWidth / rect.width;
    const scaleY = hostVideo.videoHeight / rect.height;

    socket.emit('remote-control-event', {
      streamId: activeStreamId,
      eventType: 'mousemove',
      eventData: {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    });
  }
}

function handleHostWheel(event) {
  if (isRemoteControlActive) {
    socket.emit('remote-control-event', {
      streamId: activeStreamId,
      eventType: 'wheel',
      eventData: {
        deltaX: event.deltaX,
        deltaY: event.deltaY
      }
    });

    // Prevent default scrolling
    event.preventDefault();
  }
}

function handleHostContextMenu(event) {
  if (isRemoteControlActive) {
    // Prevent the context menu from appearing
    event.preventDefault();
  }
}

// Viewer: Set up remote control listeners
function setupViewerRemoteControlListeners() {
  if (viewerVideo) {
    viewerVideo.addEventListener('keydown', handleViewerKeyDown);
    viewerVideo.addEventListener('mousedown', handleViewerMouseDown);
    viewerVideo.addEventListener('mouseup', handleViewerMouseUp);
    viewerVideo.addEventListener('mousemove', handleViewerMouseMove);
    viewerVideo.addEventListener('wheel', handleViewerWheel);
    viewerVideo.addEventListener('contextmenu', handleViewerContextMenu);

    // Make the video element focusable
    viewerVideo.setAttribute('tabindex', '0');
    viewerVideo.focus();
  }

  // Add ESC key listener to document to stop remote control
  document.addEventListener('keydown', handleViewerDocumentKeyDown);
}

// Viewer: Remove remote control listeners
function removeViewerRemoteControlListeners() {
  if (viewerVideo) {
    viewerVideo.removeEventListener('keydown', handleViewerKeyDown);
    viewerVideo.removeEventListener('mousedown', handleViewerMouseDown);
    viewerVideo.removeEventListener('mouseup', handleViewerMouseUp);
    viewerVideo.removeEventListener('mousemove', handleViewerMouseMove);
    viewerVideo.removeEventListener('wheel', handleViewerWheel);
    viewerVideo.removeEventListener('contextmenu', handleViewerContextMenu);

    // Remove focusable attribute
    viewerVideo.removeAttribute('tabindex');
  }

  document.removeEventListener('keydown', handleViewerDocumentKeyDown);
}

// Viewer: Handle keyboard events
function handleViewerKeyDown(event) {
  if (isRemoteControlActive) {
    socket.emit('remote-control-event', {
      streamId: currentStreamId,
      eventType: 'keydown',
      eventData: {
        key: event.key,
        code: event.code,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey
      }
    });

    // Prevent default browser behavior for most keys
    if (event.key !== 'F5' && !(event.ctrlKey && event.key === 'r')) {
      event.preventDefault();
    }
  }
}

function handleViewerDocumentKeyDown(event) {
  if (isRemoteControlActive && event.key === 'Escape') {
    stopRemoteControl();
    event.preventDefault();
  }
}

// Viewer: Handle mouse events
function handleViewerMouseDown(event) {
  if (isRemoteControlActive) {
    const rect = viewerVideo.getBoundingClientRect();
    const scaleX = viewerVideo.videoWidth / rect.width;
    const scaleY = viewerVideo.videoHeight / rect.height;

    socket.emit('remote-control-event', {
      streamId: currentStreamId,
      eventType: 'mousedown',
      eventData: {
        button: event.button,
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    });

    event.preventDefault();
  }
}

function handleViewerMouseUp(event) {
  if (isRemoteControlActive) {
    const rect = viewerVideo.getBoundingClientRect();
    const scaleX = viewerVideo.videoWidth / rect.width;
    const scaleY = viewerVideo.videoHeight / rect.height;

    socket.emit('remote-control-event', {
      streamId: currentStreamId,
      eventType: 'mouseup',
      eventData: {
        button: event.button,
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    });

    event.preventDefault();
  }
}

function handleViewerMouseMove(event) {
  if (isRemoteControlActive) {
    const rect = viewerVideo.getBoundingClientRect();
    const scaleX = viewerVideo.videoWidth / rect.width;
    const scaleY = viewerVideo.videoHeight / rect.height;

    socket.emit('remote-control-event', {
      streamId: currentStreamId,
      eventType: 'mousemove',
      eventData: {
        x: (event.clientX - rect.left) * scaleX,
        y: (event.clientY - rect.top) * scaleY
      }
    });
  }
}

function handleViewerWheel(event) {
  if (isRemoteControlActive) {
    socket.emit('remote-control-event', {
      streamId: currentStreamId,
      eventType: 'wheel',
      eventData: {
        deltaX: event.deltaX,
        deltaY: event.deltaY
      }
    });

    // Prevent default scrolling
    event.preventDefault();
  }
}

function handleViewerContextMenu(event) {
  if (isRemoteControlActive) {
    // Prevent the context menu from appearing
    event.preventDefault();
  }
}

// Host: Handle remote control events from viewer
async function handleRemoteControlEvent(eventType, eventData) {
  try {
    switch (eventType) {
      case 'keydown':
        await simulateKeyEvent(eventData);
        break;
      case 'mousedown':
        await simulateMouseEvent('mousedown', eventData);
        break;
      case 'mouseup':
        await simulateMouseEvent('mouseup', eventData);
        break;
      case 'mousemove':
        await simulateMouseEvent('mousemove', eventData);
        break;
      case 'wheel':
        await simulateWheelEvent(eventData);
        break;
      default:
        console.warn('Unknown remote control event type:', eventType);
    }
  } catch (error) {
    console.error('Error handling remote control event:', error);
  }
}

// Host: Simulate keyboard event
async function simulateKeyEvent(eventData) {
  console.info('Simulating key event:', eventData.key);

  try {
    // Use the electronAPI to simulate key events
    const result = await window.electronAPI.simulateKeyEvent(eventData);

    if (!result.success) {
      console.error('Error simulating key event:', result.error);
    }

    return result.success;
  } catch (error) {
    console.error('Error calling simulateKeyEvent:', error);
    return false;
  }
}

// Host: Simulate mouse event
async function simulateMouseEvent(type, eventData) {
  console.info('Simulating mouse event:', type, eventData);

  try {
    // Use the electronAPI to simulate mouse events
    const result = await window.electronAPI.simulateMouseEvent(type, eventData);

    if (!result.success) {
      console.error('Error simulating mouse event:', result.error);
    }

    return result.success;
  } catch (error) {
    console.error('Error calling simulateMouseEvent:', error);
    return false;
  }
}

// Host: Simulate wheel event
async function simulateWheelEvent(eventData) {
  console.info('Simulating wheel event:', eventData);

  try {
    // Use the electronAPI to simulate wheel events
    const result = await window.electronAPI.simulateWheelEvent(eventData);

    if (!result.success) {
      console.error('Error simulating wheel event:', result.error);
    }

    return result.success;
  } catch (error) {
    console.error('Error calling simulateWheelEvent:', error);
    return false;
  }
}

// Both: Stop remote control
function stopRemoteControl() {
  if (isRemoteControlActive) {
    const streamId = isStreaming ? activeStreamId : currentStreamId;

    socket.emit('stop-remote-control', { streamId });

    // Update state
    isRemoteControlActive = false;
    remoteControlViewerId = null;

    // Update UI
    showStatus('Stopping remote control...');

    // Remove event listeners
    if (isStreaming) {
      removeRemoteControlListeners();
    } else {
      removeViewerRemoteControlListeners();
    }
  }
}

// Viewer: Request remote control
function requestRemoteControl() {
  if (socket && currentStreamId) {
    socket.emit('request-remote-control', { streamId: currentStreamId });
    showStatus('Requesting remote control...');
  } else {
    showStatus('Cannot request remote control: not connected to a stream', true);
  }
}

// Initialize
checkUrlForStreamId();
