# Screen Share Client with Remote Control

This application allows you to share your screen and enable remote control functionality, allowing viewers to control your screen remotely.

## Features

- Screen sharing via WebRTC
- Real-time communication via Socket.IO
- Remote control functionality (viewer can control host's screen)
- Cross-platform support (Windows, macOS, Linux)
- Secure connections with HTTPS and WSS
- Ngrok integration for remote access

## Remote Control Functionality

The remote control feature allows viewers to request control of the host's screen. Here's how it works:

### For Viewers:

1. Connect to a stream
2. Click the "Request Remote Control" button
3. Wait for the host to accept the request
4. Once accepted, you can control the host's screen by:
   - Moving your mouse over the video
   - Clicking on elements
   - Using your keyboard
5. Press ESC or click "Stop Remote Control" to end the session

### For Hosts:

1. Start sharing your screen
2. When a viewer requests control, you'll see a confirmation dialog
3. Accept or reject the request
4. If accepted, the viewer can now control your screen
5. Press ESC at any time to stop the remote control session

## Implementation Notes

The remote control functionality works by:

1. Capturing mouse and keyboard events from the viewer
2. Sending these events to the host via WebSocket
3. Simulating these events on the host's system

For full functionality, a native module like `robotjs` would be needed to simulate input events on the host system. The current implementation logs the events but doesn't actually simulate them due to compatibility issues with Electron.

To implement full remote control functionality, you would need to:

1. Install a compatible native module for input simulation
2. Update the simulation functions in main.js to use the native module
3. Rebuild the native module for your Electron version

## Security Considerations

Remote control functionality gives viewers significant control over the host's system. Use this feature with caution and only with trusted viewers.
