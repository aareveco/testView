const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Screen capture
  getSources: () => ipcRenderer.invoke('get-sources'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // DevTools
  openDevTools: () => ipcRenderer.invoke('open-devtools'),

  // Remote control
  simulateKeyEvent: (eventData) => ipcRenderer.invoke('simulate-key-event', eventData),
  simulateMouseEvent: (type, eventData) => ipcRenderer.invoke('simulate-mouse-event', { type, eventData }),
  simulateWheelEvent: (eventData) => ipcRenderer.invoke('simulate-wheel-event', eventData),
  getScreenSize: () => ipcRenderer.invoke('get-screen-size')
});

// Expose environment variables to the renderer process
contextBridge.exposeInMainWorld('electron', {
  env: {
    SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || '',
    PEER_SERVER_URL: process.env.PEER_SERVER_URL || ''
  },
  getEnv: () => {
    console.log('Environment variables:', {
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL,
      PEER_SERVER_URL: process.env.PEER_SERVER_URL
    });
    return {
      SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || '',
      PEER_SERVER_URL: process.env.PEER_SERVER_URL || ''
    };
  }
});
