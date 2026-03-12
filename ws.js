const SERVER_URL = window.location.hostname === 'localhost' 
    ? "ws://localhost:8080" 
    : "wss://tpms-dashboard.onrender.com";

const socket = new WebSocket(SERVER_URL);

socket.onopen = () => {
    console.log(`Connected to WebSocket server at ${SERVER_URL}`);
}

function updateWheel(id, wheel) {
    const idUpper = id.toUpperCase();
    const psiElement = document.getElementById("psi" + idUpper);
    const tempElement = document.getElementById("temp" + idUpper);
    const cardElement = document.getElementById(idUpper);
    
    const pressure = parseFloat(wheel.pressure) || 0;
    const temp = parseInt(wheel.temp) || 0;

    if (psiElement) psiElement.innerText = pressure.toFixed(1) + " PSI";
    if (tempElement) tempElement.innerText = temp + "°C";
    
    // Update card background based on pressure
    if (cardElement && typeof getPressureColor === 'function') {
        cardElement.style.background = getPressureColor(pressure);
    }
    
    // Update 3D Model
    if (window.updateWheel3D) {
        window.updateWheel3D(id, wheel);
    }
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