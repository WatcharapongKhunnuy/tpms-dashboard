// TPMS Pro Dashboard Application Logic

// Initialize Splash Screen
window.addEventListener('load', () => {
    const splash = document.getElementById('splash');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 800);
        }, 1500);
    }
});

// Update Tire UI Elements
function updateTireUI(id, wheel) {
    const card = document.getElementById(id.toLowerCase());
    if (!card) return;

    const psiEl = card.querySelector('.psi');
    const tempEl = card.querySelector('.temp');

    if (psiEl) psiEl.innerText = `${parseFloat(wheel.pressure).toFixed(1)} PSI`;
    if (tempEl) tempEl.innerText = `${wheel.temp}°C`;
}

// Offline UI Control
function showOffline() {
    document.body.classList.add("offline");
}

function hideOffline() {
    document.body.classList.remove("offline");
}

// Register PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('Service Worker Registered!', reg))
            .catch(err => console.error('Service Worker Failed!', err));
    });
}
