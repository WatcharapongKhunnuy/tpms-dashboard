const SERVER_URL = window.location.hostname === 'localhost' 
    ? "ws://localhost:8080" 
    : "wss://tpms-dashboard.onrender.com";

const socket = new WebSocket(SERVER_URL);

socket.onopen = () => {
    console.log(`Connected to WebSocket server at ${SERVER_URL}`);
}

function updateWheel(id, wheel) {
    const psiElement = document.getElementById("psi" + id.toUpperCase());
    const tempElement = document.getElementById("temp" + id.toUpperCase());
    
    if (psiElement) psiElement.innerText = wheel.pressure + " PSI";
    if (tempElement) tempElement.innerText = wheel.temp + "°C";
    
    // Also log for debugging
    console.log(`Updated ${id}:`, wheel);
}

socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type !== "update" && msg.type !== "init") return;

    const d = msg.data;
    if (d.fl) updateWheel("fl", d.fl);
    if (d.fr) updateWheel("fr", d.fr);
    if (d.rl) updateWheel("rl", d.rl);
    if (d.rr) updateWheel("rr", d.rr);
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