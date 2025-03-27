# Screen Sharing Server

A standalone server for the screen sharing application that allows multiple clients to connect and share screens.

## Features

- Decoupled server architecture
- Stream ID system for easy sharing
- WebRTC signaling for peer-to-peer connections
- Support for multiple simultaneous streams

## Installation

1. Install dependencies:
```
cd server-app
npm install
```

2. Start the server:
```
npm start
```

## Usage

The server will start on port 3000 by default. You can change this by setting the PORT environment variable.

### Server URLs

- Main server: `http://localhost:3000`
- Viewer page: `http://localhost:3000/view`
- Specific stream: `http://localhost:3000/view/{streamId}`

### API Endpoints

The server provides the following Socket.IO events:

- `start-stream`: Start a new stream
- `stop-stream`: Stop an active stream
- `get-stream`: Get information about a specific stream
- `offer`, `answer`, `ice-candidate`: WebRTC signaling events

## Connecting from the Main Application

1. Enter the server URL in the main application
2. Click "Connect"
3. Start sharing your screen
4. Share the generated stream ID or URL with viewers

## Connecting as a Viewer

1. Open the viewer URL in a browser
2. Enter a stream ID or select from available streams
3. View the shared screen in real-time

## Security Considerations

This server does not include authentication or encryption. For production use, consider adding:

- HTTPS support
- Authentication for hosts and viewers
- Stream access controls
