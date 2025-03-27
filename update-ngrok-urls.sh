#!/bin/bash

# This script updates the .env files with ngrok URLs

# Check if ngrok is running
if ! pgrep -x "ngrok" > /dev/null; then
    echo "Error: ngrok is not running. Please start ngrok first."
    echo "Run: ngrok start --config=ngrok.yml socket-server peer-server"
    exit 1
fi

# Get ngrok URLs - simpler approach
NGROK_JSON=$(curl -s http://localhost:4040/api/tunnels)

# Extract all URLs
ALL_URLS=$(echo "$NGROK_JSON" | grep -o '"public_url":"[^"]*"' | grep -o 'http[^"]*')

# Print all URLs for debugging
echo "Available ngrok URLs:"
echo "$ALL_URLS"

# Get the first HTTPS URL for socket server
SOCKET_URL=$(echo "$ALL_URLS" | grep 'https' | head -1)

# If no HTTPS URL found, try HTTP
if [ -z "$SOCKET_URL" ]; then
    SOCKET_URL=$(echo "$ALL_URLS" | head -1)
    # Convert to HTTPS if it's HTTP
    SOCKET_URL=${SOCKET_URL/http:/https:}
fi

# Get the second URL for peer server
PEER_URL=$(echo "$ALL_URLS" | grep -v "$SOCKET_URL" | head -1)

# If no second URL found, use the first one
if [ -z "$PEER_URL" ]; then
    PEER_URL=$SOCKET_URL
fi

# Convert to HTTPS if it's HTTP
PEER_URL=${PEER_URL/http:/https:}

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
