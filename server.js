const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('WebSocket server is running on ws://localhost:8080');

// Generate simulated TPMS data
function generateTPMSData() {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    data: {
      fl: { pressure: (Math.random() * (35 - 30) + 30).toFixed(1), temp: Math.floor(Math.random() * (45 - 35) + 35), status: 'ok' },
      fr: { pressure: (Math.random() * (35 - 30) + 30).toFixed(1), temp: Math.floor(Math.random() * (45 - 35) + 35), status: 'ok' },
      rl: { pressure: (Math.random() * (35 - 30) + 30).toFixed(1), temp: Math.floor(Math.random() * (45 - 35) + 35), status: 'ok' },
      rr: { pressure: (Math.random() * (35 - 30) + 30).toFixed(1), temp: Math.floor(Math.random() * (45 - 35) + 35), status: 'ok' }
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  // Send initial data
  ws.send(generateTPMSData());

  // Set interval to send data every 5 seconds
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(generateTPMSData());
    }
  }, 5000);

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});
