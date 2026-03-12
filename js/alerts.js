let alertState = {};

function checkTireAlert(id, pressure) {
    const card = document.getElementById(id.toLowerCase());
    if (!card) return;

    if (pressure < 28) {
        card.classList.add("alert");

        // Only send notification if alert wasn't already triggered for this wheel
        if (!alertState[id]) {
            sendNotification(`Low tire pressure on ${id.toUpperCase()}: ${pressure} PSI`);
            alertState[id] = true;
        }
    } else {
        card.classList.remove("alert");
        alertState[id] = false;
    }
}

function sendNotification(msg) {
    if ("Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification("TPMS ALERT", { body: msg, icon: "icons/icon-192.png" });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
}
