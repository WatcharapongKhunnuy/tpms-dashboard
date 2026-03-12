(() => {

const container = document.getElementById("car3d");
if (!container || !window.THREE) return;

let width = container.clientWidth;
let height = container.clientHeight;

/* ---------- Scene ---------- */

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  width / height,
  0.1,
  1000
);

camera.position.set(5,3,6);

/* ---------- Renderer ---------- */

const renderer = new THREE.WebGLRenderer({
  antialias:true,
  alpha:true,
  powerPreference:"high-performance"
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width,height);

container.appendChild(renderer.domElement);

/* ---------- Lighting ---------- */

const ambient = new THREE.AmbientLight(0xffffff,0.9);
scene.add(ambient);

const light = new THREE.DirectionalLight(0xffffff,1);
light.position.set(5,10,7);
scene.add(light);

/* ---------- Car Model ---------- */

const car = new THREE.Group();

/* Body */

const body = new THREE.Mesh(
 new THREE.BoxGeometry(2.2,0.6,4),
 new THREE.MeshStandardMaterial({
  color:0x00ffaa,
  metalness:0.7,
  roughness:0.3
 })
);

car.add(body);

/* Roof */

const roof = new THREE.Mesh(
 new THREE.BoxGeometry(1.5,0.5,2),
 new THREE.MeshStandardMaterial({
  color:0x00ffaa,
  metalness:0.7,
  roughness:0.3
 })
);

roof.position.y = 0.55;
roof.position.z = -0.2;

car.add(roof);

/* ---------- Wheels ---------- */

const wheelGeometry = new THREE.CylinderGeometry(0.4,0.4,0.35,32);

const wheels = [];

function createWheel(x,z){

 const wheel = new THREE.Mesh(
   wheelGeometry,
   new THREE.MeshStandardMaterial({color:0x333333})
 );

 wheel.rotation.z = Math.PI/2;
 wheel.position.set(x,-0.3,z);

 wheels.push(wheel);
 car.add(wheel);

}

createWheel(1.1,1.3);   // FL
createWheel(-1.1,1.3);  // FR
createWheel(1.1,-1.3);  // RL
createWheel(-1.1,-1.3); // RR

scene.add(car);

/* ---------- Resize ---------- */

function resize(){

 width = container.clientWidth;
 height = container.clientHeight;

 camera.aspect = width/height;
 camera.updateProjectionMatrix();

 renderer.setSize(width,height);

}

window.addEventListener("resize",resize);

/* ---------- TPMS Wheel Alert ---------- */

window.updateWheel3D = (id,pressure)=>{

 const map = {fl:0,fr:1,rl:2,rr:3};

 const wheel = wheels[map[id]];

 if(!wheel) return;

 if(pressure < 28){

   wheel.material.color.set(0xff0000);

 }else{

   wheel.material.color.set(0x333333);

 }

};

/* ---------- Animation ---------- */

let angle = 0;

function animate(){

 requestAnimationFrame(animate);

 angle += 0.003;

 /* Camera orbit */

 camera.position.x = Math.sin(angle)*6;
 camera.position.z = Math.cos(angle)*6;

 camera.lookAt(0,0,0);

 /* Wheel spin */

 wheels.forEach(w=>{
   w.rotation.x += 0.1;
 });

 renderer.render(scene,camera);

}

animate();

})();
