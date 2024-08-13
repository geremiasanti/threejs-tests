import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import cubeUrl from '/3d/cube.glb';

// renderer and canvas
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// controls
new OrbitControls(camera, renderer.domElement);

// helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// adding model to scene
const loader = new GLTFLoader();
loader.load(
    cubeUrl, 
    function(gltf) {
        scene.add(gltf.scene);
    },
    undefined,
    function(err) {
        console.error(err);
    }
);

// light
const light = new THREE.AmbientLight(0x404040);
scene.add(light);

// rendering scene
function animate() { 
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);
