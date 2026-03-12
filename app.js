// Initialization and Splash Screen
window.addEventListener('load', () => {
    const splash = document.getElementById('splash');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 500);
        }, 2000);
    }
});

// Helper for UI styling based on pressure
function getPressureColor(psi) {
    if (psi < 28) return 'rgba(255, 0, 0, 0.2)'; // Low pressure alert
    if (psi > 45) return 'rgba(255, 165, 0, 0.2)'; // High pressure alert
    return 'rgba(0, 229, 255, 0.2)'; // Normal
}
