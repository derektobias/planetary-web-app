let realisticScale = false;
const sizeScaleFactor = 0.35;


let viewMode = "planet";
let currentRotationSpeed = 0.002;
let timeScale = 1;


let glow1;
let glow2;


// Scene
const container = document.getElementById("viewer");


// Texture loader
const loader = new THREE.TextureLoader();


// MAIN SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);


// Groups for switching views
const planetGroup = new THREE.Group();
const solarSystemGroup = new THREE.Group();


scene.add(planetGroup);
scene.add(solarSystemGroup);


solarSystemGroup.visible = false;


// Star background
const starTexture = loader.load("../assets/textures/star.png");
const starGeometry = new THREE.BufferGeometry();
const brightStarGeometry = new THREE.BufferGeometry();
const starCount = 7000;
const brightStarCount = 1200;


const starVertices = [];
const brightStarVertices = [];


// -------- MILKY WAY BAND --------
for(let i = 0; i < starCount * 0.7; i++){


const radius = 3500 + Math.random() * 1500;
const angle = Math.random() * Math.PI * 2;


// thin galactic plane
const height = (Math.random() - 0.5) * 1000;


const x = Math.cos(angle) * radius;
const z = Math.sin(angle) * radius;
const y = height;


if(Math.random() < 0.15){
    brightStarVertices.push(x,y,z);
}else{
    starVertices.push(x,y,z);
}


}


// -------- BACKGROUND STARS --------
for(let i = 0; i < starCount * 0.4; i++){


const radius = 4200 + Math.random() * 1500;


const theta = Math.random() * Math.PI * 2;
const phi = Math.acos(2 * Math.random() - 1);


const x = radius * Math.sin(phi) * Math.cos(theta);
const y = radius * Math.sin(phi) * Math.sin(theta);
const z = radius * Math.cos(phi);


if(Math.random() < 0.15){
    brightStarVertices.push(x,y,z);
}else{
    starVertices.push(x,y,z);
}


}


starGeometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(starVertices,3)
);
brightStarGeometry.setAttribute(
"position",
new THREE.Float32BufferAttribute(brightStarVertices,3)
);


const starMaterial = new THREE.PointsMaterial({
map:starTexture,
color:0xfff5e6,
size:12,
transparent:true,
alphaTest:0.5,
sizeAttenuation:false
});
const brightStarMaterial = new THREE.PointsMaterial({
map:starTexture,
color:0xffffff,
size:22,
transparent:true,
alphaTest:0.5,
sizeAttenuation:false
});


starMaterial.vertexColors = false;
starMaterial.depthWrite = false;
brightStarMaterial.vertexColors = false;
brightStarMaterial.depthWrite = false;


const stars = new THREE.Points(starGeometry,starMaterial);
const brightStars = new THREE.Points(brightStarGeometry,brightStarMaterial);


stars.rotation.z = 0.4;
brightStars.rotation.z = 0.4;


stars.renderOrder = -1;
brightStars.renderOrder = -1;


scene.add(stars);
scene.add(brightStars);


// MILKY WAY NEBULA BAND
const galaxyTexture = loader.load("../assets/textures/milkyway_band.jpg");


// Prevent seams
galaxyTexture.wrapS = THREE.RepeatWrapping;
galaxyTexture.wrapT = THREE.ClampToEdgeWrapping;


const galaxyMaterial = new THREE.MeshBasicMaterial({
    map: galaxyTexture,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false
});


// Make the sky sphere MUCH larger than the stars
const galaxyGeometry = new THREE.SphereGeometry(300, 64, 64);


const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
galaxy.material.blending = THREE.AdditiveBlending;


// Flip the sphere so we see the inside
galaxy.scale.set(-1, 1, 1);


// Tilt the Milky Way
galaxy.rotation.set(0, Math.PI / 2, 0.4);


// Ensure it renders behind stars
galaxy.renderOrder = -10;


scene.add(galaxy);


// Camera
const camera = new THREE.PerspectiveCamera(
75,
container.clientWidth / 600,
0.1,
5000
);


camera.lookAt(0,0,0);


// Renderer
const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(container.clientWidth,600);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);


// Lighting
// SUN LIGHT
const sunLight = new THREE.DirectionalLight(0xffffff, 2);
sunLight.position.set(20,0,0);
scene.add(sunLight);


// Ambient light so dark side isn't completely black
const ambient = new THREE.AmbientLight(0xffffff,0.25);
scene.add(ambient);


let planet;
let planetPivot;
let solarPlanets = [];
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };


// Planet data
const planetData = {


"mercury.jpg":{
radius:0.38,
tilt:0.03,
rotation:0.0008,
orbit:10,
orbitSpeed:0.04
},


"venus.jpg":{
radius:0.95,
tilt:177.4,
rotation:-0.0002,
orbit:14,
orbitSpeed:0.015
},


"earth.jpg":{
radius:1,
tilt:23.4,
rotation:0.002,
orbit:19,
orbitSpeed:0.01
},


"mars.jpg":{
radius:0.53,
tilt:25.2,
rotation:0.0018,
orbit:26,
orbitSpeed:0.008
},


"jupiter.jpg":{
radius:11.2,
tilt:3.1,
rotation:0.004,
orbit:40,
orbitSpeed:0.002
},


"saturn.jpg":{
radius:9.45,
tilt:26.7,
rotation:0.0038,
orbit:55,
orbitSpeed:0.0015
},


"uranus.jpg":{
radius:4.0,
tilt:97.8,
rotation:0.0025,
orbit:70,
orbitSpeed:0.001
},


"neptune.jpg":{
radius:3.9,
tilt:28.3,
rotation:0.0026,
orbit:85,
orbitSpeed:0.0008
}


};


// Load planet function
function loadPlanet(textureFile){


const texturePath = realisticScale
? "../assets/textures/8k/" + textureFile
: "../assets/textures/8k/" + textureFile;


loader.load(
texturePath,


function(texture){


const material = new THREE.MeshPhongMaterial({
map:texture
});


// Checks for planetary body scaling and creates body accordingly
if(planetPivot){
planetGroup.remove(planetPivot);
planetPivot = null;
planet = null;
}


const data = planetData[textureFile];


currentRotationSpeed = data.rotation;


let radius = 3;


if(realisticScale){
radius = data.radius * sizeScaleFactor;
}


planetPivot = new THREE.Object3D();
planetGroup.add(planetPivot);


planet = new THREE.Mesh(
new THREE.SphereGeometry(radius,64,64),
material
);


planetPivot.rotation.z = THREE.MathUtils.degToRad(data.tilt);
planetPivot.add(planet);




//// EARTH CLOUDS


if(textureFile === "earth.jpg"){


const cloudTexture = loader.load("../assets/textures/8k/earth_clouds.jpg");


const cloudMaterial = new THREE.MeshPhongMaterial({
map:cloudTexture,
transparent:true,
opacity:0.4
});


const clouds = new THREE.Mesh(
new THREE.SphereGeometry(radius * 1.01,64,64),
cloudMaterial
);


planet.add(clouds);


}




//// VENUS ATMOSPHERE


if(textureFile === "venus.jpg"){


const atmosphereTexture = loader.load("../assets/textures/8k/venus_atmosphere.jpg");


const atmosphereMaterial = new THREE.MeshPhongMaterial({
map:atmosphereTexture,
transparent:true,
opacity:0.6
});


const atmosphere = new THREE.Mesh(
new THREE.SphereGeometry(radius * 1.02,64,64),
atmosphereMaterial
);


planet.add(atmosphere);


}




//// SATURN RINGS


//// SATURN RINGS


if(textureFile === "saturn.jpg"){


const ringTexture = loader.load("../assets/textures/8k/saturn_ring.png");


const ringGeometry = new THREE.RingGeometry(
radius * 1.1,
radius * 1.8,
128
);


const ringMaterial = new THREE.MeshBasicMaterial({
map:ringTexture,
side:THREE.DoubleSide,
transparent:true,
depthWrite:false
});


const ring = new THREE.Mesh(ringGeometry, ringMaterial);


ring.rotation.x = Math.PI / 2.05;


ring.position.z = 0.01;


planet.add(ring);


}


},


undefined,


function(error){
console.error("Texture failed to load:", error);
}


);


}


// Default planet
loadPlanet("earth.jpg");


// Camera position
if(realisticScale){
camera.position.z = 50;
}else{
camera.position.z = 8;
}


// Animation loop
function animate(){


requestAnimationFrame(animate);


// planet animation
if(planetPivot){


if(selector.value === "venus.jpg"){
planet.rotation.y += Math.abs(currentRotationSpeed) * timeScale;
}


else{
planet.rotation.y += currentRotationSpeed * timeScale;
}


}


// Sun animation
if(viewMode === "system" && glow1 && glow2){


glow1.rotation.y += 0.001;
glow2.rotation.y -= 0.0005;


}


// solar system animation
solarPlanets.forEach(p => {


p.pivot.rotation.y += p.orbitSpeed * timeScale;
p.mesh.rotation.y += p.rotation * timeScale;


});


renderer.render(scene,camera);


}


animate();


// Dropdown selector
const selector = document.getElementById("planetSelect");


selector.addEventListener("change", () => {


console.log("Loading planet:", selector.value);


loadPlanet(selector.value);


});


// Simulation speed selector
const speedSelector = document.getElementById("timeSpeed");


speedSelector.addEventListener("change", () => {


timeScale = Number(speedSelector.value);


});


// Scales planetary body sizes
const scaleToggle = document.getElementById("scaleToggle");


scaleToggle.addEventListener("change", () => {


realisticScale = scaleToggle.checked;


loadPlanet(selector.value);


});


// Allow click and spin of planets via user mouse
renderer.domElement.addEventListener("mousedown", () => {
isDragging = true;
});


renderer.domElement.addEventListener("mouseup", () => {
isDragging = false;
});


renderer.domElement.addEventListener("mousemove", (event) => {


if(!isDragging || !planet) return;


const deltaMove = {
x: event.offsetX - previousMousePosition.x,
y: event.offsetY - previousMousePosition.y
};


planetPivot.rotation.y += deltaMove.x * 0.005;
planetPivot.rotation.x += deltaMove.y * 0.005;


previousMousePosition = {
x: event.offsetX,
y: event.offsetY
};


});


// Scroll wheel zoom
renderer.domElement.addEventListener("wheel", (event) => {


camera.position.z += event.deltaY * 0.02;


camera.position.z = Math.max(5, Math.min(300, camera.position.z));


});


// Check for user selecting Planet View button
document.getElementById("planetViewBtn").onclick = () => {


viewMode = "planet";


planetGroup.visible = true;
solarSystemGroup.visible = false;


};


// Check for user selecting Solar System View button
document.getElementById("systemViewBtn").onclick = () => {


viewMode = "system";


planetGroup.visible = false;
solarSystemGroup.visible = true;


camera.position.set(0,35,50);
camera.lookAt(0,0,0);


buildSolarSystem();


};


// Build Solar System
function buildSolarSystem(){


solarSystemGroup.clear();
solarPlanets = [];


// SUN
const sunTexture = loader.load("../assets/textures/sun.jpg");


const sunGeometry = new THREE.SphereGeometry(6,64,64);


const sunMaterial = new THREE.MeshBasicMaterial({
map:sunTexture
});


const sun = new THREE.Mesh(sunGeometry, sunMaterial);
solarSystemGroup.add(sun);


// SUN GLOW
// INNER GLOW
glow1 = new THREE.Mesh(
new THREE.SphereGeometry(7.5,64,64),
new THREE.MeshBasicMaterial({
color:0xffcc55,
transparent:true,
opacity:0.35
})
);


// OUTER CORONA
glow2 = new THREE.Mesh(
new THREE.SphereGeometry(10,64,64),
new THREE.MeshBasicMaterial({
color:0xff8833,
transparent:true,
opacity:0.18
})
);


solarSystemGroup.add(glow1);
solarSystemGroup.add(glow2);


// Sunlight
const sunLight = new THREE.PointLight(0xffffff,2,500);


sunLight.position.set(0,0,0);


solarSystemGroup.add(sunLight);


// PLANETS


for(const textureFile in planetData){


const data = planetData[textureFile];


// orbit pivot
const orbitPivot = new THREE.Object3D();
solarSystemGroup.add(orbitPivot);


// planet texture
const texture = loader.load("../assets/textures/2k/" + textureFile);


const planetMaterial = new THREE.MeshPhongMaterial({
map:texture
});


// scaled planet size
const radius = data.radius * 0.6;


const planetMesh = new THREE.Mesh(
new THREE.SphereGeometry(radius,32,32),
planetMaterial
);


// SATURN RINGS


if(textureFile === "saturn.jpg"){


const ringTexture = loader.load("../assets/textures/saturn_ring.png");


const ringGeometry = new THREE.RingGeometry(
radius * 1.1,
radius * 1.8,
128
);


const ringMaterial = new THREE.MeshBasicMaterial({
map:ringTexture,
side:THREE.DoubleSide,
transparent:true,
depthWrite:false
});


const ring = new THREE.Mesh(ringGeometry, ringMaterial);


ring.rotation.x = Math.PI/2;
ring.rotation.z = THREE.MathUtils.degToRad(26.7);


planetMesh.add(ring);


}


// position planet away from sun
planetMesh.position.x = data.orbit;


// add tilt
planetMesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);


// attach to pivot
orbitPivot.add(planetMesh);


// ORBIT RING


const orbitRingGeometry = new THREE.RingGeometry(
data.orbit-0.05,
data.orbit+0.05,
128
);


const orbitMaterial = new THREE.MeshBasicMaterial({
color:0x444444,
side:THREE.DoubleSide
});


const orbitRing = new THREE.Mesh(orbitRingGeometry,orbitMaterial);


orbitRing.rotation.x = Math.PI/2;


solarSystemGroup.add(orbitRing);




// store for animation


solarPlanets.push({
pivot:orbitPivot,
mesh:planetMesh,
orbitSpeed:data.orbitSpeed,
rotation:data.rotation
});


}


}


// Zoom in/out option for user
document.getElementById("zoomInBtn").onclick = () => {


camera.position.z -= 2;
camera.position.z = Math.max(5, camera.position.z);


};


document.getElementById("zoomOutBtn").onclick = () => {


camera.position.z += 2;
camera.position.z = Math.min(300, camera.position.z);


};
