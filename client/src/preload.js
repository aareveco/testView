const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Screen capture
  getSources: () => ipcRenderer.invoke('get-sources'),

  // External links
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});

// Expose environment variables to the renderer process
contextBridge.exposeInMainWorld('electron', {
  env: {
    SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL || '',
    PEER_SERVER_URL: process.env.PEER_SERVER_URL || ''
  }
});
