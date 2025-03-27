const { app, BrowserWindow, ipcMain, desktopCapturer, shell } = require('electron');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Keep a global reference of the window object to avoid garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments: [
        `--socket-server-url=${process.env.SOCKET_SERVER_URL || ''}`,
        `--peer-server-url=${process.env.PEER_SERVER_URL || ''}`
      ],
      webSecurity: false, // Disable web security for development
      allowRunningInsecureContent: true // Allow loading insecure content
    }
  });

  // Disable Content Security Policy
  // This is necessary for development to allow loading external resources
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // Remove any existing CSP headers
        'Content-Security-Policy': [''],
        'X-Content-Security-Policy': [''],
        'X-WebKit-CSP': ['']
      }
    });
  });

  // Set a permissive CSP directly on the window
  mainWindow.webContents.executeJavaScript(`
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;";
    document.head.appendChild(meta);
    console.log('CSP meta tag added');
  `);

  // Log environment variables
  console.log('Environment variables in main process:', {
    SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL,
    PEER_SERVER_URL: process.env.PEER_SERVER_URL
  });

  // Load the index.html of the app
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  // Register keyboard shortcuts
  const { globalShortcut } = require('electron');

  // Toggle DevTools with F12 or Cmd+Opt+I / Ctrl+Shift+I
  globalShortcut.register('F12', () => {
    if (mainWindow) {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Reload the app with Ctrl+R / Cmd+R
  globalShortcut.register('CommandOrControl+R', () => {
    if (mainWindow) {
      mainWindow.reload();
    }
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Unregister shortcuts when app is about to quit
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
});

// Handle IPC messages from renderer process
ipcMain.handle('get-sources', async () => {
  try {
    console.log('Main process: Getting screen sources');

    // Get screen sources with more detailed logging
    console.log('Calling desktopCapturer.getSources...');
    const sources = await desktopCapturer.getSources({
      types: ['screen', 'window'],
      thumbnailSize: { width: 400, height: 400 }
    });

    console.log(`Main process: Found ${sources.length} sources`);

    // Log each source for debugging
    sources.forEach((source, index) => {
      console.log(`Source ${index + 1}:`, {
        id: source.id,
        name: source.name,
        display_id: source.display_id,
        hasThumbnail: !!source.thumbnail
      });
    });

    // Return the sources to the renderer process
    return sources;
  } catch (error) {
    console.error('Main process: Error getting sources:', error);
    return { error: true, message: error.message, stack: error.stack };
  }
});

// Handle opening URLs in external browser
ipcMain.handle('open-external', (event, url) => {
  console.log('Opening external URL:', url);
  shell.openExternal(url);
  return true;
});

// Handle opening DevTools
ipcMain.handle('open-devtools', () => {
  console.log('Opening DevTools from renderer request');
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
    return true;
  }
  return false;
});

// Remote control handlers using Electron's built-in APIs
const { screen } = require('electron');
const robot = {
  getScreenSize: () => {
    const primaryDisplay = screen.getPrimaryDisplay();
    return { width: primaryDisplay.size.width, height: primaryDisplay.size.height };
  }
};

// Handle key events
ipcMain.handle('simulate-key-event', async (event, eventData) => {
  console.log('Simulating key event:', eventData);

  try {
    // Log the key event for now
    console.log('Key event:', eventData.key, 'modifiers:', {
      ctrl: eventData.ctrlKey,
      shift: eventData.shiftKey,
      alt: eventData.altKey,
      meta: eventData.metaKey
    });

    // In a real implementation, we would use a native module to simulate key presses
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    console.error('Error simulating key event:', error);
    return { success: false, error: error.message };
  }
});

// Handle mouse events
ipcMain.handle('simulate-mouse-event', async (event, data) => {
  console.log('Simulating mouse event:', data.type, data.eventData);

  try {
    const { type, eventData } = data;

    // Get screen size for scaling
    const screenSize = robot.getScreenSize();

    // Scale coordinates to screen size
    const x = Math.round(eventData.x);
    const y = Math.round(eventData.y);

    // Ensure coordinates are within screen bounds
    const boundedX = Math.max(0, Math.min(x, screenSize.width - 1));
    const boundedY = Math.max(0, Math.min(y, screenSize.height - 1));

    // Log the mouse event
    console.log(`Mouse ${type} at (${boundedX}, ${boundedY}) button: ${eventData.button}`);

    // In a real implementation, we would use a native module to simulate mouse events
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    console.error('Error simulating mouse event:', error);
    return { success: false, error: error.message };
  }
});

// Handle wheel events
ipcMain.handle('simulate-wheel-event', async (event, eventData) => {
  console.log('Simulating wheel event:', eventData);

  try {
    // Log the wheel event
    console.log(`Wheel event: deltaX=${eventData.deltaX}, deltaY=${eventData.deltaY}`);

    // In a real implementation, we would use a native module to simulate wheel events
    // For now, we'll just return success
    return { success: true };
  } catch (error) {
    console.error('Error simulating wheel event:', error);
    return { success: false, error: error.message };
  }
});

// Get screen size
ipcMain.handle('get-screen-size', async () => {
  try {
    return robot.getScreenSize();
  } catch (error) {
    console.error('Error getting screen size:', error);
    return { width: 1920, height: 1080 }; // Default fallback
  }
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, re-create a window when dock icon is clicked
app.on('activate', function () {
  if (mainWindow === null) createWindow();
});
