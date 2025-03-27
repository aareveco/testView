# Screen Share Client

A unified client application for screen sharing and viewing, built with Electron.

## Features

- **Dual Mode**: Functions as both a host (sharing) and viewer (watching) in a single application
- **Stream ID System**: Connect to specific streams using unique IDs
- **Server Connection**: Connect to any compatible signaling server
- **WebRTC Streaming**: High-quality, low-latency screen sharing
- **User-Friendly Interface**: Simple tabs for switching between host and viewer modes

## Installation

1. Install dependencies:
```
cd client
npm install
```

2. Start the application:
```
npm start
```

## Usage

### Host Mode (Sharing Your Screen)

1. **Connect to Server**:
   - Enter the server URL (e.g., `http://localhost:3000`)
   - Click "Connect"

2. **Share Your Screen**:
   - Click "Get Sources" to see available screens and windows
   - Select a screen or window to start sharing locally
   - Click "Start Streaming" to make it available to remote viewers
   - Share the generated stream ID or URL with viewers

3. **Stop Sharing**:
   - Click "Stop Streaming" to stop remote sharing
   - Click "Stop Sharing" to stop all sharing

### Viewer Mode (Watching Remote Screens)

1. **Connect to Server**:
   - Enter the same server URL as the host
   - Click "Connect"

2. **View a Stream**:
   - Enter a stream ID and click "Connect", or
   - Select from the list of available streams
   - The remote screen will be displayed in the viewer

3. **Disconnect**:
   - Click "Disconnect" to stop viewing

## Connecting via Stream ID

You can directly connect to a stream by:

1. Entering the stream ID in the viewer mode
2. Sharing the URL with the stream ID parameter: `?streamId=STREAM_ID`
3. Sharing the direct viewer URL: `http://SERVER_URL/view/STREAM_ID`

## Server Compatibility

This client works with any server that implements the compatible signaling protocol. The server must support:

- Socket.IO for signaling
- Stream ID generation and management
- WebRTC offer/answer exchange

## Troubleshooting

If you encounter issues:

1. Check the server connection
2. Verify the stream ID is correct
3. Use the "Show Debug Info" button in viewer mode to see connection details
4. Check the DevTools console for error messages
