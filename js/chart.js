const ctx = document.getElementById('pressureChart').getContext('2d');

const pressureChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [
            { label: 'FL', data: [], borderColor: '#00ffee', tension: 0.4, pointRadius: 0 },
            { label: 'FR', data: [], borderColor: '#ff00ff', tension: 0.4, pointRadius: 0 },
            { label: 'RL', data: [], borderColor: '#ffff00', tension: 0.4, pointRadius: 0 },
            { label: 'RR', data: [], borderColor: '#00ff00', tension: 0.4, pointRadius: 0 }
        ]
    },
    options: {
        responsive: true,
        animation: false, // Disable animations for performance
        plugins: {
            legend: { labels: { color: 'white' } }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: '#222' },
                ticks: { color: 'white' }
            },
            x: {
                grid: { color: '#222' },
                ticks: { color: 'white' }
            }
        }
    }
});

const MAX_POINTS = 50;
let needsChartUpdate = false;

// 3️⃣ Chart update throttling (Update at 1 FPS)
setInterval(() => {
    if (needsChartUpdate) {
        pressureChart.update('none');
        needsChartUpdate = false;
    }
}, 1000);

function addPressureData(data) {
    const time = new Date().toLocaleTimeString();
    pressureChart.data.labels.push(time);
    
    pressureChart.data.datasets[0].data.push(data.fl.pressure);
    pressureChart.data.datasets[1].data.push(data.fr.pressure);
    pressureChart.data.datasets[2].data.push(data.rl.pressure);
    pressureChart.data.datasets[3].data.push(data.rr.pressure);

    if (pressureChart.data.labels.length > MAX_POINTS) {
        pressureChart.data.labels.shift();
        pressureChart.data.datasets.forEach(ds => ds.data.shift());
    }

    needsChartUpdate = true; // Signal for the interval to update
}
