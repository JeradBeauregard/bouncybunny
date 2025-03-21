// Import three.js and GLTFLoader
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';



// Setup scene and camera
const scene = new THREE.Scene();
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 20;

const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2,
  (frustumSize * aspect) / 2,
  frustumSize / 2,
  -frustumSize / 2,
  0.1,
  1000
);
camera.position.set(0, 0, 10);
camera.zoom = 20;
camera.updateProjectionMatrix();
camera.lookAt(0, 0, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting (required for PBR models like DamagedHelmet)
const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
scene.add(light);

// Background color
scene.background = new THREE.Color(0xffffff);

// Load Model
let model;
const loader = new GLTFLoader();
loader.load(
  'https://threejs.org/examples/models/gltf/DamagedHelmet/glTF-Binary/DamagedHelmet.glb',
  (gltf) => {
    model = gltf.scene;
    model.scale.set(0.5, 0.5, 0.5); // Adjust to fit scene
    model.position.set(0, 0, 0); // Keep in view
    scene.add(model);
  },
  undefined,
  (error) => {
    console.error('Error loading GLTF model:', error);
  }
);

// Movement logic
const velocity = new THREE.Vector3(0, 0, 0);
let isFalling = false;
let velocityActive = false;

const modelSize = 0.5;
const buffer = 1.5;
let boundaries = {};

function updateBoundaries() {
  boundaries = {
    left: camera.left + modelSize + buffer,
    right: camera.right - modelSize - buffer,
    top: camera.top - modelSize - buffer,
    bottom: camera.bottom + modelSize + buffer,
  };
}
updateBoundaries();

window.addEventListener('resize', () => {
  const aspect = window.innerWidth / window.innerHeight;
  camera.left = (-frustumSize * aspect) / 2;
  camera.right = (frustumSize * aspect) / 2;
  camera.top = frustumSize / 2;
  camera.bottom = -frustumSize / 2;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateBoundaries();
});

// Animation loop
function animate() {
  if (model) {
    // Movement
    if (velocityActive && !isFalling) {
      model.position.add(velocity);
    }

    // Boundary checks
    if (model.position.x < boundaries.left) {
      model.position.x = boundaries.left;
      velocity.x = 0;
    } else if (model.position.x > boundaries.right) {
      model.position.x = boundaries.right;
      velocity.x = 0;
    }

    if (model.position.y < boundaries.bottom) {
      model.position.y = boundaries.bottom;
      velocity.y = 0;
    } else if (model.position.y > boundaries.top) {
      model.position.y = boundaries.top;
      velocity.y = 0;
    }

    // Falling logic
    if (isFalling) {
      model.position.y -= 0.1;
      if (model.position.y <= boundaries.bottom) {
        model.position.y = boundaries.bottom;
        isFalling = false;
      }
    }
  }

  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// Click interaction
document.addEventListener('click', (event) => {
  if (!model) return;

  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1
  );

  const rayCaster = new THREE.Raycaster();
  rayCaster.setFromCamera(mouse, camera);

  const clickPosition = new THREE.Vector3();
  rayCaster.ray.at(0, clickPosition); // Raycast to Z = 0

  const direction = model.position.clone().sub(clickPosition).normalize();

  const randomOffsetX = (Math.random() - 0.5) * 0.5;
  const randomOffsetY = (Math.random() - 0.5) * 0.5;
  direction.x += randomOffsetX;
  direction.y += randomOffsetY;
  direction.normalize();

  velocity.set(direction.x, 1, 0).multiplyScalar(1);
  velocityActive = true;

  setTimeout(() => {
    velocityActive = false;
    isFalling = true;
  }, 1000);
});
