import * as THREE from 'three';

// --- INITIALIZATION ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6ec0ff); // Sky blue
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(5, 10, 7.5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x404040));

// --- THE TRACK ---
const roadWidth = 12;
const roadLength = 5000;
const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength);
const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const road = new THREE.Mesh(roadGeo, roadMat);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Road Markings (White dashed lines)
for (let i = 0; i < roadLength; i += 10) {
    const lineGeo = new THREE.PlaneGeometry(0.2, 5);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const line = new THREE.Mesh(lineGeo, lineMat);
    line.rotation.x = -Math.PI / 2;
    line.position.set(0, 0.01, -i + (roadLength/2));
    scene.add(line);
}

// --- CAR FACTORY ---
function createCar(color, x, z) {
    const group = new THREE.Group();
    // Car Body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.6, 2.5),
        new THREE.MeshStandardMaterial({ color: color })
    );
    group.add(body);
    // Car Roof
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.5, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x111111 })
    );
    roof.position.y = 0.5;
    group.add(roof);
    
    group.position.set(x, 0.3, z);
    scene.add(group);
    return group;
}

const player = createCar(0xff0000, 0, 0); // Player
const enemies = [
    { mesh: createCar(0x0000ff, -3, -30), speed: 0.25 }, // Competitor 1
    { mesh: createCar(0xffff00, 3, -60), speed: 0.28 },  // Competitor 2
    { mesh: createCar(0x00ff00, 0, -90), speed: 0.22 }   // Competitor 3
];

// --- CONTROLS ---
let moveLeft = false;
let moveRight = false;

document.getElementById('leftBtn').onmousedown = () => moveLeft = true;
document.getElementById('leftBtn').onmouseup = () => moveLeft = false;
document.getElementById('rightBtn').onmousedown = () => moveRight = true;
document.getElementById('rightBtn').onmouseup = () => moveRight = false;

// Handle Touch
document.getElementById('leftBtn').ontouchstart = () => moveLeft = true;
document.getElementById('leftBtn').ontouchend = () => moveLeft = false;
document.getElementById('rightBtn').ontouchstart = () => moveRight = true;
document.getElementById('rightBtn').ontouchend = () => moveRight = false;

// --- MAIN GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);

    // Constant Forward Speed
    const baseSpeed = 0.3;
    player.position.z -= baseSpeed;

    // Movement Logic
    if (moveLeft && player.position.x > -roadWidth/2 + 1) player.position.x -= 0.15;
    if (moveRight && player.position.x < roadWidth/2 - 1) player.position.x += 0.15;

    // Camera Logic (Follow Behind)
    camera.position.set(player.position.x * 0.7, 3, player.position.z + 7);
    camera.lookAt(player.position.x, 0, player.position.z - 10);

    // Enemy Logic & Rank Calculation
    let myRank = 4;
    enemies.forEach(enemy => {
        enemy.mesh.position.z -= enemy.speed;
        // If enemy is further ahead (more negative Z), our rank drops
        if (enemy.mesh.position.z < player.position.z) {
            myRank--;
        }
    });

    // Update HUD
    document.getElementById('rank').innerText = Math.max(1, myRank);
    document.getElementById('speed').innerText = Math.floor(baseSpeed * 400);

    renderer.render(scene, camera);
}

// Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();