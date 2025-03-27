# Ngrok Setup for Server and Client

This repository contains a setup for exposing a server and client application using ngrok.

## Prerequisites

- [ngrok](https://ngrok.com/download) installed
- Node.js and npm installed

## Setup

1. Install dependencies for both server and client:

```bash
cd server-app
npm install dotenv
cd ../client
npm install dotenv
```

2. Start ngrok using the configuration file:

```bash
ngrok start --config=ngrok.yml socket-server peer-server
```

   **Important Notes for ngrok**:
   - Always use the HTTPS URLs provided by ngrok
   - The first connection attempt might take longer or fail - this is normal with ngrok
   - If you get a connection error, try refreshing the page
   - If you see "parser error" messages, the client will automatically try to reconnect with different settings
   - If you see Socket.IO loading errors, the client will try multiple fallback sources
   - For local testing, you can use http://localhost:5001 which will use more reliable connection settings
   - The debug console will show detailed connection information
   - If you're still having issues, try restarting ngrok and the server

3. Update the .env files with the ngrok URLs:

```bash
./update-ngrok-urls.sh
```

4. Start the server:

```bash
cd server-app
node server.js
```

5. Start the client:

```bash
cd client
npm start
```

## Configuration

- `ngrok.yml`: Contains the ngrok configuration for exposing the server
- `server-app/.env`: Contains environment variables for the server
- `client/.env`: Contains environment variables for the client
- `update-ngrok-urls.sh`: Script to update the .env files with ngrok URLs

## Notes

- The server runs on port 5001 by default
- The peer server runs on port 9000 by default
- The ngrok URLs are automatically updated in the .env files when running the update script
- The client disables Content Security Policy restrictions for development purposes
- Web security is disabled in the Electron app to allow loading external resources
- Socket.IO is loaded from multiple sources with fallbacks in case the primary source fails
- Styles are loaded from an external CSS file to avoid inline style restrictions
- The client automatically detects direct connections (localhost) vs. ngrok connections
- Additional error handling is added to make the code more robust

## Security Warning

**Note**: This application disables several security features (CSP, webSecurity) for development purposes. This is not recommended for production use. Before deploying to production, you should:

1. Enable Content Security Policy with appropriate restrictions
2. Enable webSecurity in the Electron app
3. Use proper integrity checks for external resources
4. Implement proper authentication and authorization
