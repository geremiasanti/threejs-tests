import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { Noise } from 'noisejs';

import leafUrl from '/3d/leaves/leaf0.glb';

/*
// debug
import { GUI } from 'lil-gui'
const gui = new GUI();
*/

init();
function init() {
	const noise = new Noise(Math.random());
	let t = 0;

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
	const camera = new THREE.OrthographicCamera(cameraBoundingRect.left, cameraBoundingRect.right, cameraBoundingRect.top, cameraBoundingRect.bottom, 1, 40);

	/* 
	// debug
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 5;
	*/

	// controls
	new OrbitControls(camera, renderer.domElement);

	// axes helpers
	const axesHelper = new THREE.AxesHelper(5);
	scene.add(axesHelper);

	// light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
	directionalLight.position.x = -5;
	directionalLight.position.y = 10;
	directionalLight.position.z = 5;
	directionalLight.castShadow = true;
	// shadow properties for the light
	directionalLight.shadow.mapSize.width = 512; // default
	directionalLight.shadow.mapSize.height = 512; // default
	directionalLight.shadow.camera.near = 1; // default
	directionalLight.shadow.camera.far = 40; // default
	scene.add(directionalLight);

	// adding model to scene
	const loader = new GLTFLoader();
	let leavesObj;
	loader.load(
		leafUrl, 
		function(gltf) { 
			leavesObj = initLeaves(scene, cameraBoundingRect, gltf, directionalLight);
		},
		undefined,
		function(err) {
			console.error(err);
		}
	);

	function animate() { 
		if(leavesObj) {
			animateLeaves(t, leavesObj, noise);
		}

		t++;
		renderer.render(scene, camera);
	}
	renderer.setAnimationLoop(animate);
}

function initLeaves(scene, cameraBoundingRect, gltf, directionalLight) {
	const leafSize = getGeometrySize(gltf.scene);

	const horizontalOffset = leafSize.x;
	const verticalOffset = leafSize.y * .46;

	const leafPerRow = Math.ceil(cameraBoundingRect.width / horizontalOffset) + 3;
	const leafPerColumn = Math.ceil(cameraBoundingRect.height / verticalOffset) + 3;
	const amount = leafPerRow * leafPerColumn;

	const leavesColors = [
		new THREE.Color(0x1d2e28),
		new THREE.Color(0x06402b),
		new THREE.Color(0x18392b),
		new THREE.Color(0x14452f),
		new THREE.Color(0x0f5132),
		new THREE.Color(0x0a5c36)
	]

	// scene content
	const geometry = gltf.scene.children[0].geometry;
	const material = new THREE.MeshLambertMaterial();
	const leaves = new THREE.InstancedMesh(geometry, material, amount);
	leaves.receiveShadow = true;
	leaves.position.z = -10;
	leaves.position.x = -2;
	leaves.rotation.y = .4

	const leafStartingRotationX = -.35;
	const dummy = new THREE.Object3D();
	dummy.rotation.x = leafStartingRotationX;
	for(let y = 0; y < leafPerColumn; y++) {
		for(let x = 0; x < leafPerRow; x++) {
			let i = x + y * leafPerRow;

			let xPos = cameraBoundingRect.left + x * horizontalOffset;
			let yPos = cameraBoundingRect.top - y * verticalOffset;

			// offset every other row
			if(y % 2) {
				xPos -= horizontalOffset / 2;
			}

			dummy.position.set(xPos, yPos, 0);
			dummy.updateMatrix();

			leaves.setMatrixAt(i, dummy.matrix)

			leaves.setColorAt(
				i, 
				leavesColors[
					Math.floor(Math.random() * leavesColors.length)
				]
			)
		}
	}

	// will be updated every frame
	leaves.instanceMatrix.setUsage(THREE.DynamicDrawUsage); 

	scene.add(leaves);

	directionalLight.target = leaves;
	///*
	// debug
	const helper = new THREE.DirectionalLightHelper(directionalLight, 5);
	scene.add(helper);
	//*/

	return {
		instancedMesh: leaves,
		leafPerRow: leafPerRow,	
		leafPerColumn: leafPerColumn,	
		leafStartingRotationX: leafStartingRotationX,
		horizontalOffset: horizontalOffset,
		verticalOffset: verticalOffset,
		boundingRect: cameraBoundingRect
	};
}

function getGeometrySize(geometry) {
	const box = new THREE.Box3().setFromObject(geometry);
	return {
		x: box.max.x - box.min.x,
		y: box.max.y - box.min.y,
		z: box.max.z - box.min.z
	};
}

function animateLeaves(t, leavesObj, noise) {
	const {
		instancedMesh, 
		leafPerRow, 
		leafPerColumn, 
		leafStartingRotationX, 
		horizontalOffset, 
		verticalOffset, 
		boundingRect
	} = leavesObj;

	const dummy = new THREE.Object3D();
	for(let y = 0; y < leafPerColumn; y++) {
		for(let x = 0; x < leafPerRow; x++) {
			let i = x + y * leafPerRow;

			// position in the matrix
			let xPos = boundingRect.left + x * horizontalOffset;
			let yPos = boundingRect.top - y * verticalOffset;
			// offset every other row
			if(y % 2) {
				xPos -= horizontalOffset / 2;
			}
			dummy.position.set(xPos, yPos, 0);

			// rotation from noise
			let xRotationNoise  = noise.simplex3(
				x / leafPerRow, 
				y / leafPerColumn, 
				t / 100
			) 
			dummy.rotation.x = Math.min(
				leafStartingRotationX + xRotationNoise,
				leafStartingRotationX
			);
			let zRotationNoise  = noise.simplex2(i, t / 100)
			dummy.rotation.z = zRotationNoise / 10;

			dummy.updateMatrix();
			instancedMesh.setMatrixAt(i, dummy.matrix)
		}
	}

	instancedMesh.instanceMatrix.needsUpdate = true;
	instancedMesh.computeBoundingSphere();
}
