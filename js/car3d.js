(function() {
    const carContainer = document.getElementById("car3d");
    if (!carContainer) return;

    const carScene = new THREE.Scene();
    const carCamera = new THREE.PerspectiveCamera(75, carContainer.clientWidth / carContainer.clientHeight, 0.1, 1000);

    const carRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    carRenderer.setSize(carContainer.clientWidth, carContainer.clientHeight);
    carRenderer.setPixelRatio(window.devicePixelRatio);
    carContainer.appendChild(carRenderer.domElement);

    // Lighting
    const carAmbientLight = new THREE.AmbientLight(0xffffff, 1);
    carScene.add(carAmbientLight);

    const carDirLight = new THREE.DirectionalLight(0xffffff, 1);
    carDirLight.position.set(5, 10, 5);
    carScene.add(carDirLight);

    // Car Group
    const carGroup = new THREE.Group();

    // Car Body
    const carBody = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.6, 4),
        new THREE.MeshStandardMaterial({ color: 0x00ffaa, metalness: 0.7, roughness: 0.1 })
    );
    carGroup.add(carBody);

    // Car Roof
    const carRoof = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.5, 2),
        new THREE.MeshStandardMaterial({ color: 0x00ffaa, metalness: 0.7, roughness: 0.1 })
    );
    carRoof.position.y = 0.5;
    carRoof.position.z = -0.2;
    carGroup.add(carRoof);

    // Wheels
    const carWheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
    const carWheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const carWheels = [];

    const addCarWheel = (x, y, z) => {
        const wheel = new THREE.Mesh(carWheelGeom, carWheelMat.clone());
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        carWheels.push(wheel);
        carGroup.add(wheel);
    };

    addCarWheel(1.1, -0.3, 1.2);  // FL
    addCarWheel(-1.1, -0.3, 1.2); // FR
    addCarWheel(1.1, -0.3, -1.2); // RL
    addCarWheel(-1.1, -0.3, -1.2); // RR

    carScene.add(carGroup);
    carCamera.position.set(4, 3, 5);
    carCamera.lookAt(0, 0, 0);

    function carAnimate() {
        requestAnimationFrame(carAnimate);
        carGroup.rotation.y += 0.005;
        carRenderer.render(carScene, carCamera);
    }
    carAnimate();

    window.updateWheel3D = (id, pressure) => {
        const wheelIndex = { fl: 0, fr: 1, rl: 2, rr: 3 };
        const wheel = carWheels[wheelIndex[id]];
        if (wheel) {
            wheel.material.color.set(pressure < 28 ? 0xff0000 : 0x333333);
        }
    };

    window.addEventListener('resize', () => {
        carRenderer.setSize(carContainer.clientWidth, carContainer.clientHeight);
        carCamera.aspect = carContainer.clientWidth / carContainer.clientHeight;
        carCamera.updateProjectionMatrix();
    });
})();
