import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import leafUrl from '/3d/leaves/leaf0.glb';

init();

function init() {
	// renderer and canvas
	const renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// scene 
	const scene = new THREE.Scene();

	let cameraBoundingRect = {
		left: -window.innerWidth / 100,
		right: window.innerWidth / 100,
		top: window.innerHeight / 100,
		bottom: -window.innerHeight / 100,
	}
	cameraBoundingRect.width = cameraBoundingRect.right - cameraBoundingRect.left;
	cameraBoundingRect.height = cameraBoundingRect.top - cameraBoundingRect.bottom;

	// camera
	const camera = new THREE.OrthographicCamera(cameraBoundingRect.left,  cameraBoundingRect.right, cameraBoundingRect.top, cameraBoundingRect.bottom, 1, 10);

	/* 
	// debug
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
			initLeaves(scene, cameraBoundingRect, gltf);
		},
		undefined,
		function(err) {
			console.error(err);
		}
	);

	function animate() { 
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animate);
}

function initLeaves(scene, cameraBoundingRect, gltf) {
	const leafSize = getGeometrySize(gltf.scene);

	const horizontalOffset = leafSize.x;
	const verticalOffset = leafSize.y * .46;

	const leafPerRow = Math.ceil(cameraBoundingRect.width / horizontalOffset) + 1;
	const leafPerColumn = Math.ceil(cameraBoundingRect.height / verticalOffset) + 1;
	const amount = leafPerRow * leafPerColumn;

	// scene content
	const geometry = gltf.scene.children[0].geometry;
	const material = new THREE.MeshLambertMaterial();
	const leaves = new THREE.InstancedMesh(geometry, material, amount);
	leaves.position.z = -5;
	leaves.rotation.x = .0;
	leaves.rotation.y = .0;

	const dummy = new THREE.Object3D();
	dummy.rotation.x = -.3;
	for(let y = 0; y < leafPerColumn; y++) {
		for(let x = 0; x < leafPerRow; x++) {
			let i = x + y * leafPerRow;

			let xPos = cameraBoundingRect.left + x * horizontalOffset;
			let yPos = cameraBoundingRect.top - y * verticalOffset;

			// offset every other row
			if(y % 2) {
				xPos -= horizontalOffset / 2;
			}

			// todo
			dummy.position.set(
				xPos,
				yPos,
				0
			);
			dummy.updateMatrix();
			leaves.setMatrixAt(i, dummy.matrix)

		}
	}

	// will be updated every frame
	leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage); 

	scene.add(leaves);
}

function getGeometrySize(geometry) {
	const box = new THREE.Box3().setFromObject(geometry);
	return {
		x: box.max.x - box.min.x,
		y: box.max.y - box.min.y,
		z: box.max.z - box.min.z
	};
}
