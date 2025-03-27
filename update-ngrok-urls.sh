#!/bin/bash

# This script updates the .env files with ngrok URLs

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "Error: ngrok is not running. Please start ngrok first."
    echo "Run: ngrok start --config=ngrok.yml socket-server peer-server"
    exit 1
fi

# Get ngrok URLs
SOCKET_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep -o 'http[^"]*' | head -1)
PEER_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | grep -o 'http[^"]*' | tail -1)

if [ -z "$SOCKET_URL" ] || [ -z "$PEER_URL" ]; then
    echo "Error: Could not get ngrok URLs. Make sure ngrok is running properly."
    exit 1
fi

echo "Found ngrok URLs:"
echo "Socket Server: $SOCKET_URL"
echo "Peer Server: $PEER_URL"

# Update server-app/.env
if [ -f "server-app/.env" ]; then
    sed -i '' "s|NGROK_URL=.*|NGROK_URL=$SOCKET_URL|g" server-app/.env
    echo "Updated server-app/.env with ngrok URL"
else
    echo "Error: server-app/.env not found"
fi

# Update client/.env
if [ -f "client/.env" ]; then
    sed -i '' "s|SOCKET_SERVER_URL=.*|SOCKET_SERVER_URL=$SOCKET_URL|g" client/.env
    sed -i '' "s|PEER_SERVER_URL=.*|PEER_SERVER_URL=$PEER_URL|g" client/.env
    echo "Updated client/.env with ngrok URLs"
else
    echo "Error: client/.env not found"
fi

echo "Done!"
