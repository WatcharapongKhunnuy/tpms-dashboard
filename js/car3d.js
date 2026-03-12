const container = document.getElementById("car3d");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// Car Group
const carGroup = new THREE.Group();

// Car Body
const body = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.6, 4),
    new THREE.MeshStandardMaterial({ color: 0x00ffaa, metalness: 0.7, roughness: 0.1 })
);
carGroup.add(body);

// Car Top
const top = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x00ffaa, metalness: 0.7, roughness: 0.1 })
);
top.position.y = 0.5;
top.position.z = -0.2;
carGroup.add(top);

// Wheels
const wheelGeom = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
const wheels = [];

const addWheel = (x, y, z) => {
    const wheel = new THREE.Mesh(wheelGeom, wheelMat.clone());
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    wheels.push(wheel);
    carGroup.add(wheel);
};

addWheel(1.1, -0.3, 1.2);  // FL
addWheel(-1.1, -0.3, 1.2); // FR
addWheel(1.1, -0.3, -1.2); // RL
addWheel(-1.1, -0.3, -1.2); // RR

scene.add(carGroup);
camera.position.set(4, 3, 5);
camera.lookAt(0, 0, 0);

function animate() {
    requestAnimationFrame(animate);
    carGroup.rotation.y += 0.005;
    renderer.render(scene, camera);
}
animate();

window.updateWheel3D = (id, pressure) => {
    const wheelIndex = { fl: 0, fr: 1, rl: 2, rr: 3 };
    const wheel = wheels[wheelIndex[id]];
    if (wheel) {
        wheel.material.color.set(pressure < 28 ? 0xff0000 : 0x333333);
    }
};

window.addEventListener('resize', () => {
    renderer.setSize(container.clientWidth, container.clientHeight);
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
});
