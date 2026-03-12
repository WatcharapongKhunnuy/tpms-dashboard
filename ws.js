const socket = new WebSocket("ws://localhost:8080")

socket.onopen = () => {
    console.log("Connected to WebSocket server");
}

socket.onmessage = e => {
    const data = JSON.parse(e.data)
    console.log("Received data:", data);
    updateWheel(data)
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