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
