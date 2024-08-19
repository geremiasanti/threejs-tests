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
const camera = new THREE.OrthographicCamera(window.innerWidth / - 100, window.innerWidth / 100, window.innerHeight / 100, window.innerHeight / - 100, -1, 10);
/* debug
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;
*/

// controls
new OrbitControls(camera, renderer.domElement);

// axes helpers
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// lights + helpers
const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight();
directionalLight.position.x = 5;
directionalLight.position.y = 5;
directionalLight.position.z = 5;
scene.add(directionalLight);
const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
scene.add(helper);


// adding model to scene
const loader = new GLTFLoader();
loader.load(
    leafUrl, 
    function(gltf) { 
		initLeaves(scene, gltf);
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

function initLeaves(scene, gltf) {
	const leaves = createLeaves(scene, gltf);
}

function createLeaves(scene, gltf) {
	// scene content
	const geometry = gltf.scene.children[0].geometry;
	const material = new THREE.MeshLambertMaterial();
	const leaf = new THREE.Mesh(geometry, material);
	leaf.rotation.x = 2 * Math.PI;

	const leaves = new Array(5).fill(null).map((_, i) => {
		const leafClone = leaf.clone();
		leafClone.position.x += i * 2;
		scene.add(leafClone);
		return leafClone;
	});

	return leaves
}
