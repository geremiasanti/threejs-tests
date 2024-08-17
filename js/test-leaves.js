import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import leafUrl from '/3d/leaves/leaf0.glb';

// renderer and canvas
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 5;
camera.position.y = 2;
camera.position.z = 1;

// controls
new OrbitControls(camera, renderer.domElement);

// helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// adding model to scene
const loader = new GLTFLoader();
loader.load(
    leafUrl, 
    function(gltf) { 
		initLeaves(gltf);
    },
    undefined,
    function(err) {
        console.error(err);
    }
);

// rendering scene
function animate() { 
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

function initLeaves(gltf) {
	// scene content
	const geometry = gltf.scene.children[0].geometry;
	const material = new THREE.MeshNormalMaterial();
	const leaf = new THREE.Mesh(geometry, material);
	scene.add(leaf);
}
