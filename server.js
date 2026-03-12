const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port });

console.log(`WebSocket server is running on port ${port}`);

// Store the latest data state
let latestData = {
    fl: { pressure: 0, temp: 0, status: 'offline' },
    fr: { pressure: 0, temp: 0, status: 'offline' },
    rl: { pressure: 0, temp: 0, status: 'offline' },
    rr: { pressure: 0, temp: 0, status: 'offline' }
};

wss.on('connection', (ws) => {
    console.log('New client connected');

    // Send the last known state immediately upon connection
    ws.send(JSON.stringify({ type: 'init', data: latestData }));

    ws.on('message', (message) => {
        try {
            const payload = JSON.parse(message);
            
            // If message is from ESP32 (Producer)
            if (payload.type === 'update') {
                latestData = { ...latestData, ...payload.data };
                console.log('Data updated from ESP32:', latestData);
                
                // Broadcast updated data to all connected Dashboards (Consumers)
                const broadcastData = JSON.stringify({ type: 'update', data: latestData });
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(broadcastData);
                    }
                });
            }
        } catch (e) {
            console.error('Error processing message:', e.message);
        }
    });

    ws.on('close', () => console.log('Client disconnected'));
});
