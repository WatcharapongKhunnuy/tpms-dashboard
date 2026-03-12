document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById("car3d");
    if (!container) {
        console.error("Container #car3d not found!");
        return;
    }
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / 400,
        0.1,
        1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, 400);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Ground Plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.7;
    scene.add(ground);

    // Car Group
    const carGroup = new THREE.Group();

    // Car Body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.6, 4);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc, metalness: 0.5, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    carGroup.add(body);

    // Car Top
    const topGeometry = new THREE.BoxGeometry(1.6, 0.5, 2);
    const top = new THREE.Mesh(topGeometry, bodyMaterial);
    top.position.y = 0.5;
    top.position.z = -0.2;
    carGroup.add(top);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

    const createWheel = (x, y, z) => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        return wheel;
    };

    // Position wheels: FL, FR, RL, RR
    const wheels = [
        createWheel(1.1, -0.3, 1.2),  // FL
        createWheel(-1.1, -0.3, 1.2), // FR
        createWheel(1.1, -0.3, -1.2), // RL
        createWheel(-1.1, -0.3, -1.2) // RR
    ];

    wheels.forEach(w => carGroup.add(w));
    scene.add(carGroup);

    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0, 0);

    function animate() {
        requestAnimationFrame(animate);
        carGroup.rotation.y += 0.005;
        renderer.render(scene, camera);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = 400;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    animate();
    
    // Global interface for WebSocket updates
    window.updateWheel3D = function(id, data) {
        console.log(`3D update for ${id}:`, data);
        const wheelIndex = { 'fl': 0, 'fr': 1, 'rl': 2, 'rr': 3 };
        const wheel = wheels[wheelIndex[id.toLowerCase()]];
        
        if (wheel) {
            // Change color based on pressure
            if (data.pressure < 28) {
                wheel.material.color.set(0xff0000); // Alert Red
            } else {
                wheel.material.color.set(0x333333); // Normal Dark Grey
            }
        }
    };
});
