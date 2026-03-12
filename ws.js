const SERVER_URL = window.location.hostname === 'localhost' 
    ? "ws://localhost:8080" 
    : "wss://tpms-dashboard.onrender.com";

const socket = new WebSocket(SERVER_URL);

socket.onopen = () => {
    console.log(`Connected to WebSocket server at ${SERVER_URL}`);
}

socket.onmessage = e => {
    const payload = JSON.parse(e.data);
    console.log("Received data:", payload);
    
    if (payload.type === 'init' || payload.type === 'update') {
        updateWheel(payload.data);
    }
}

socket.onerror = (error) => {
    console.error("WebSocket error:", error);
}

socket.onclose = () => {
    console.log("Disconnected from WebSocket server. Reconnecting in 3s...");
    setTimeout(() => {
        location.reload()
    }, 3000)
}