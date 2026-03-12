const SERVER_URL = window.location.hostname === 'localhost' 
    ? "ws://localhost:8080" 
    : "wss://tpms-dashboard.onrender.com";

let socket;
let heartbeat;
let dataTimeoutTimer;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 40000; // Max 40s
const DATA_TIMEOUT_MS = 60000;    // 60s without data = Offline

function validateWheel(wheel) {
    if (!wheel) return false;
    if (isNaN(parseFloat(wheel.pressure))) return false;
    if (isNaN(parseInt(wheel.temp))) return false;
    return true;
}

function resetDataTimeout() {
    clearTimeout(dataTimeoutTimer);
    if (typeof hideOffline === 'function') hideOffline();
    
    dataTimeoutTimer = setTimeout(() => {
        console.warn("No data received for 60s. Marking as offline.");
        if (typeof showOffline === 'function') showOffline();
    }, DATA_TIMEOUT_MS);
}

function connectWS() {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
        console.log(`Connected to Pro WebSocket Server: ${SERVER_URL}`);
        reconnectAttempts = 0; // Reset attempts on successful connection
        if (typeof hideOffline === 'function') hideOffline();
        resetDataTimeout();

        heartbeat = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000);
    };

    socket.onmessage = (event) => {
        resetDataTimeout(); // Reset timer on every message
        
        try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'update' || payload.type === 'init') {
                const data = payload.data;
                
                Object.keys(data).forEach(id => {
                    const wheel = data[id];
                    if (validateWheel(wheel)) {
                        if (typeof updateTireUI === 'function') updateTireUI(id, wheel);
                        if (typeof checkTireAlert === 'function') checkTireAlert(id, parseFloat(wheel.pressure));
                        if (window.updateWheel3D) window.updateWheel3D(id, parseFloat(wheel.pressure));
                    }
                });

                if (typeof addPressureData === 'function') {
                    addPressureData(data);
                }
            }
        } catch (e) {
            console.error("Data processing error:", e);
        }
    };

    socket.onclose = () => {
        clearInterval(heartbeat);
        clearTimeout(dataTimeoutTimer);
        
        if (typeof showOffline === 'function') showOffline();

        // 1️⃣ Exponential Reconnect Backoff (5s, 10s, 20s, 40s)
        const delay = Math.min(5000 * Math.pow(2, reconnectAttempts), MAX_RECONNECT_DELAY);
        console.log(`WebSocket Disconnected. Reconnecting in ${delay/1000}s...`);
        
        setTimeout(() => {
            reconnectAttempts++;
            connectWS();
        }, delay);
    };

    socket.onerror = (err) => {
        socket.close();
    };
}

// Initial connection
connectWS();
