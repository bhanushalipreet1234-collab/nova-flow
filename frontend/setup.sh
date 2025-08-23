#!/bin/bash
echo "Installing required Python packages..."
pip install aiohttp

echo "Installing required Node packages..."
npm install

echo "Setup complete! Run your application with:"
echo "npm run dev"
