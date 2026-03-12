# TPMS Dashboard

A real-time Tire Pressure Monitoring System dashboard built with Three.js and WebSockets.

## Features
- 3D Car visualization (Three.js)
- Real-time data updates via WebSocket
- Responsive Mobile UI
- Heatmap and Charts for pressure analysis

## Getting Started

### 1. Run the Dashboard
Simply open `index.html` in your browser.

### 2. Run the WebSocket Server
To see real-time data updates, you need to run the Node.js WebSocket server.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
The dashboard will connect to `ws://localhost:8080` and start receiving simulated TPMS data.

## Deployment
Deployed using GitHub Pages via GitHub Actions.
