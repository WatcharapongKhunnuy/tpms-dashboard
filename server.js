const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const port = process.env.PORT || 8081;

const server = http.createServer((req, res) => {
    // Parse URL to remove query strings like ?v=1.2
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    let filePath = '.' + pathname;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                console.log(`[404] ${filePath}`);
                res.writeHead(404);
                res.end('File not found');
            } else {
                console.log(`[500] ${filePath} - ${error.code}`);
                res.writeHead(500);
                res.end('Server error: '+error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const wss = new WebSocket.Server({ server });

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

let latestData = {
    fl: { pressure: 0, temp: 0, status: 'offline' },
    fr: { pressure: 0, temp: 0, status: 'offline' },
    rl: { pressure: 0, temp: 0, status: 'offline' },
    rr: { pressure: 0, temp: 0, status: 'offline' }
};

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.send(JSON.stringify({ type: 'init', data: latestData }));

    ws.on('message', (message) => {
        try {
            const payload = JSON.parse(message);
            if (payload.type === 'update') {
                latestData = { ...latestData, ...payload.data };
                const broadcastData = JSON.stringify({ type: 'update', data: latestData });
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(broadcastData);
                    }
                });
            }
        } catch (e) {
            console.error('Error:', e.message);
        }
    });
});
