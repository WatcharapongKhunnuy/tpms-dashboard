const SERVER_URL = window.location.hostname === 'localhost' 
    ? "ws://localhost:8080" 
    : "wss://tpms-dashboard.onrender.com";

let socket;
let heartbeat;

function validateWheel(wheel) {
    if (!wheel) return false;
    // Ensure numeric values
    if (isNaN(parseFloat(wheel.pressure))) return false;
    if (isNaN(parseInt(wheel.temp))) return false;
    return true;
}

function connectWS() {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
        console.log(`Connected to Pro WebSocket Server: ${SERVER_URL}`);
        if (typeof hideOffline === 'function') hideOffline();

        // 1️⃣ Heartbeat to prevent silent disconnects
        heartbeat = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "ping" }));
            }
        }, 30000);
    };

    socket.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'update' || payload.type === 'init') {
                const data = payload.data;
                
                // Loop through all wheels in data
                Object.keys(data).forEach(id => {
                    const wheel = data[id];
                    
                    // 2️⃣ Data Validation before updating UI
                    if (validateWheel(wheel)) {
                        if (typeof updateTireUI === 'function') updateTireUI(id, wheel);
                        if (typeof checkTireAlert === 'function') checkTireAlert(id, parseFloat(wheel.pressure));
                        
                        if (window.updateWheel3D) {
                            window.updateWheel3D(id, parseFloat(wheel.pressure));
                        }
                    }
                });

                // Update chart
                if (typeof addPressureData === 'function') {
                    addPressureData(data);
                }
            }
        } catch (e) {
            console.error("Data processing error:", e);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket Disconnected. Reconnecting in 5s...");
        if (typeof showOffline === 'function') showOffline();
        
        clearInterval(heartbeat);
        setTimeout(connectWS, 5000);
    };

    socket.onerror = (err) => {
        console.error("Socket Error:", err);
        socket.close();
    };
}

// Initial connection
connectWS();
