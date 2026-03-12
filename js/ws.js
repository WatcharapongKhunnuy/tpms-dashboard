const SERVER_URL = window.location.hostname === 'localhost' 
    ? "ws://localhost:8080" 
    : "wss://tpms-dashboard.onrender.com";

let socket;

function connectWS() {
    socket = new WebSocket(SERVER_URL);

    socket.onopen = () => {
        console.log(`Connected to Pro WebSocket Server: ${SERVER_URL}`);
    };

    socket.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'update' || payload.type === 'init') {
                const data = payload.data;
                
                // Loop through all wheels in data
                Object.keys(data).forEach(id => {
                    const wheel = data[id];
                    if (typeof updateTireUI === 'function') updateTireUI(id, wheel);
                    if (typeof checkTireAlert === 'function') checkTireAlert(id, parseFloat(wheel.pressure));
                    
                    if (window.updateWheel3D) {
                        window.updateWheel3D(id, parseFloat(wheel.pressure));
                    }
                });

                // Update chart with latest data point
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
        setTimeout(connectWS, 5000);
    };

    socket.onerror = (err) => {
        console.error("Socket Error:", err);
        socket.close();
    };
}

// Initial connection
connectWS();
