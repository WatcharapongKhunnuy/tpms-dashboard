const scene=new THREE.Scene()

const camera=new THREE.PerspectiveCamera(
75,
window.innerWidth/300,
0.1,
1000
)

const renderer=new THREE.WebGLRenderer({antialias:true})

renderer.setSize(window.innerWidth,300)

document.getElementById("car3d").appendChild(renderer.domElement)

const geometry=new THREE.BoxGeometry(4,1,2)
const material=new THREE.MeshStandardMaterial({color:0x222222})

const car=new THREE.Mesh(geometry,material)

scene.add(car)

const light=new THREE.PointLight(0xffffff,1)

light.position.set(5,5,5)

scene.add(light)

camera.position.z=6

function animate(){

requestAnimationFrame(animate)

car.rotation.y+=0.003

renderer.render(scene,camera)

}

animate()