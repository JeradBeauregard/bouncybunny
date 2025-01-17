// import three js

import * as THREE from 'three';

const scene = new THREE.Scene();
// Orthographic Camera Setup
const aspect = window.innerWidth / window.innerHeight;
const frustumSize = 20; // Adjust this value to control the visible area

const camera = new THREE.OrthographicCamera(
  (-frustumSize * aspect) / 2, // Left
  (frustumSize * aspect) / 2,  // Right
  frustumSize / 2,             // Top
  -frustumSize / 2,            // Bottom
  0.1,                         // Near clipping plane
  1000                         // Far clipping plane
);

// Position the camera
camera.position.set(0, 0, 1); // Move it back along Z
camera.lookAt(0, 0, 0);        // Ensure it looks at the center
// creates render window
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement )

//import box geometry
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );



// Velocity vector for the cube
const velocity = new THREE.Vector3(0, 0, 0);

// Flags and timers
let isFalling = false;
let velocityActive = false;

// Define cube size and boundaries
const cubeSize = 0.5; // Half the size of the cube (since the cube's size is 1)
const buffer = 1.5; // Additional buffer space to prevent edge sticking
let boundaries = {
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
};


// Function to position the cube at the bottom of the screen
function setCubeAtBottom() {
    const aspect = window.innerWidth / window.innerHeight;
    const verticalFOV = THREE.MathUtils.degToRad(camera.fov); // Convert FOV to radians
  
    // Calculate the height at the current camera Z position
    const heightAtZ = 2 * Math.tan(verticalFOV / 2) * camera.position.z;
  
    // Bottom of the screen is half the height below 0
    const bottomBoundary = -heightAtZ / 2;
  
    // Position the cube at the bottom
    cube.position.set(0, bottomBoundary + 0.5, 0); // Add half the cube's size to ensure it rests visually at the bottom
  }
  
  // Call this function after creating the cube
 // setCubeAtBottom();

// Update boundaries based on the screen size
function updateBoundaries() {
  const aspect = window.innerWidth / window.innerHeight;
  const verticalFOV = THREE.MathUtils.degToRad(camera.fov); // Vertical field of view in radians
  const heightAtZ = 2 * Math.tan(verticalFOV / 2) * camera.position.z; // Height at the current Z position
  const widthAtZ = heightAtZ * aspect; // Width based on the aspect ratio

  boundaries = {
    left: -widthAtZ / 2 + cubeSize + buffer,
    right: widthAtZ / 2 - cubeSize - buffer,
    top: heightAtZ / 2 - cubeSize - buffer,
    bottom: -heightAtZ / 2 + cubeSize + buffer,
  };
}
updateBoundaries();

//renderer , neeeded to work

function animate() {

    
    cube.position.add(velocity);

    // Boundary checks
  if (cube.position.x < boundaries.left) {
    cube.position.x = boundaries.left;
    velocity.x = 0; // Stop movement in the X direction
  } else if (cube.position.x > boundaries.right) {
    cube.position.x = boundaries.right;
    velocity.x = 0;
  }

  if (cube.position.y < boundaries.bottom) {
    cube.position.y = boundaries.bottom;
    velocity.y = 0; // Stop movement in the Y direction
  } else if (cube.position.y > boundaries.top) {
    cube.position.y = boundaries.top;
    velocity.y = 0;
  }

    // If velocity is active, update position based on velocity
    if (velocityActive && !isFalling) {
        cube.position.add(velocity);
      }
    
  
    // Falling logic
    if (isFalling) {
        cube.position.y -= 0.1; // Adjust the speed of falling here
    
        // Stop falling when the cube reaches the bottom
        if (cube.position.y <= boundaries.bottom) {
          cube.position.y = boundaries.bottom;
          isFalling = false; // Reset falling state
        }
      }
	renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );

//click functionality

// set up event listener for click event
document.addEventListener("click", (event) => {
    // Track mouse position on the screen
    const mouse = new THREE.Vector2();
    mouse.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );
  
    // Create a raycaster
    const rayCaster = new THREE.Raycaster();
    rayCaster.setFromCamera(mouse, camera);
  
    // Project the mouse click onto the XY plane (Z = 0)
    const clickPosition = new THREE.Vector3();
    rayCaster.ray.at(camera.position.z, clickPosition); // Get the point on the ray at Z = 0
  
    // Calculate the direction vector (cube to click position) and invert it
    const direction = cube.position.clone().sub(clickPosition).normalize();
  
    // Add a slight random offset to make the motion dynamic
    const randomOffsetX = (Math.random() - 0.5) * 0.5; // Random value between -0.25 and 0.25
    const randomOffsetY = (Math.random() - 0.5) * 0.5; // Random value between -0.25 and 0.25
    direction.x += randomOffsetX;
    direction.y += randomOffsetY;
  
    // Normalize the direction again after adding the offset
    direction.normalize();
  
    // Set the velocity to the adjusted direction
    velocity.set(direction.x, 1, 0).multiplyScalar(1); // Add upward Y motion (1) and adjust speed
  
    // Enable velocity for 1 second, then trigger gravity
    velocityActive = true; // Enable velocity
    setTimeout(() => {
      velocityActive = false; // Disable velocity
      isFalling = true; // Trigger falling
    }, 1000); // 1 second
  });
  

function changeColor(){

    const randomColor = Math.random() * 0xffffff; // Random hexadecimal color
    material.color.set(randomColor);

}

function setRandomVelocity() {
    // Generate random values for x and y velocity components
    const randomX = (Math.random() - 0.5) * 2; // Random value between -1 and 1
    const randomY = (Math.random() - 0.5) * 2; // Random value between -1 and 1
  
   velocity.set(randomX*0.1, randomY*0.1, 0) // Only move on the XY plane'
   
  }