// BABYLON is imported into memory when the script is loaded in the HTML file
// this is true of every script, so it's important to include them all there

// window.requestAnimationFrame = (function () {
//     return window.requestAnimationFrame ||
//         window.webkitRequestAnimationFrame ||
//         window.mozRequestAnimationFrame ||
//         function (callback) {
//             window.setTimeout(callback, 1000 / 60);
//         };
// })();

// https://makina-corpus.com/blog/metier/2014/how-to-use-multimaterials-with-a-tiled-ground-in-babylonjs

var canvas;
var engine;
var device;
var scene;
var mesh;
var meshes = [];
var mera;

document.addEventListener("DOMContentLoaded", init, false);

function init() {

	canvas = document.getElementById("frontBuffer");

	// canvas = document.getElementById('canvas');

	engine = new BABYLON.Engine(canvas, true);

	scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3.Black();

	// var box = BABYLON.Mesh.CreateBox("Box", 4.0, scene);

	// var material = new BABYLON.StandardMaterial("material1", scene);
	// material.wireframe = true;
	// material.diffuseColor = BABYLON.Color3.Blue();
	// material.emissiveColor = BABYLON.Color3.Red();

	// material.specularColor = BABYLON.Color3.Red();
	// material.specularPower = 3;
	// material.alpha = 1.0;

	// var material = new BABYLON.StandardMaterial("material1", scene);

	// material.diffuseTexture = new BABYLON.Texture("disk.png", scene);
	// material.bumpTexture = new BABYLON.Texture("disk_normal.png", scene);
	// material.roughness = 0.5;
	// box.material = material;

	// var plane = BABYLON.Mesh.CreatePlane("plane", 10.0, scene, false,
	// 	BABYLON.Mesh.DOUBLESIDE);
	// plane.material = new BABYLON.StandardMaterial("material2", scene);
	// plane.material.diffuseColor = new BABYLON.Color3.White();
	// plane.material.backFaceCulling = false;
	// plane.position = new BABYLON.Vector3(0, 0, -5);
	// var orientation = new BABYLON.Vector3.RotationFromAxis(0, 0, 0);
	// plane.rotate(1,0,0);
	// Part 1 : Creation of Tiled Ground
	// Parameters
	var xmin = -16;
	var zmin = -16;
	var xmax = 16;
	var zmax = 16;
	var precision = {
		"w": 1,
		"h": 1
	};
	var subdivisions = {
		'h': 32,
		'w': 32
	};

	// Create the Tiled Ground
	var tiledGround = new BABYLON.Mesh.CreateTiledGround("Tiled Ground", xmin, zmin, xmax, zmax, subdivisions, precision, scene, true);
	tiledGround.position.x = 0.5;
	tiledGround.position.z = 0.5;

	// Part 2 : Create the multi material
	// Create differents materials
	var emptyTileMaterial = new BABYLON.StandardMaterial("Empty", scene);
	emptyTileMaterial.emissiveTexture = new BABYLON.Texture('./sprite/emptyTile.png', scene);//, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	emptyTileMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	var highlightedTileMaterial = new BABYLON.StandardMaterial("Highlight", scene);
	highlightedTileMaterial.emissiveTexture = new BABYLON.Texture('./sprite/highlightTile.png', scene);//, false, false, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	highlightedTileMaterial.specularColor = new BABYLON.Color3(0, 0, 0);

	// Create Multi Material
	var multimat = new BABYLON.MultiMaterial("multi", scene);
	multimat.subMaterials.push(emptyTileMaterial);
	multimat.subMaterials.push(highlightedTileMaterial);


	// Part 3 : Apply the multi material
	// Define multimat as material of the tiled ground
	tiledGround.material = multimat;

	// Needed variables to set subMeshes
	var verticesCount = tiledGround.getTotalVertices();
	var tileIndicesLength = tiledGround.getIndices().length / (subdivisions.w * subdivisions.h);
	console.log(tileIndicesLength);

	// // Set subMeshes of the tiled ground
	// tiledGround.subMeshes = [];
	// var base = 0;
	// for (var row = 0; row < subdivisions.h; row++) {
	// 	for (var col = 0; col < subdivisions.w; col++) {
	// 		tiledGround.subMeshes.push(new BABYLON.SubMesh(row % 2 ^ col % 2, 0, verticesCount, base, tileIndicesLength, tiledGround));
	// 		base += tileIndicesLength;
	// 	}
	// }

	// Set subMeshes of the tiled ground
	tiledGround.subMeshes = [];

	// some notes
	// the 0 and verticesCount are used to indicate the first and last vertex for the entire supermesh
	// that said, through experimentation, they don't seem to do anything
	// 'base' is the start index for the verticies that will be colour by the material
	// in this case, each tile is a square, so that is two triangles
	// so tileIndicesLength should be 6 vertices for each cell (6 for precision 1, 24 for precision 2, etc)

	var base = 0;
	for (var row = 0; row < subdivisions.h; row++) {
		for (var col = 0; col < subdivisions.w; col++) {
			tiledGround.subMeshes.push(new BABYLON.SubMesh(0, 0, verticesCount, base, tileIndicesLength, tiledGround));
			base += tileIndicesLength;
		}
	}

	// zooming is weird. These values help make it less weird.
	// minimum radius keeps the camera far enough away to prevent clipping
	// scaling factor helps the scrolling seem a bit more significant. bigger means slower zoom
	// minimum and maximum zoom determine... the zoom limits.
	var minimumRadius = 1000;
	var zoomScalingFactor = 1000;
	var minimumZoom = 25;
	var maximumZoom = 75;

	var camera = new BABYLON.ArcRotateCamera("arcCam",
		BABYLON.Tools.ToRadians(45),
		BABYLON.Tools.ToRadians(45),
		(1 / ((maximumZoom + minimumZoom) / 2)) * zoomScalingFactor + minimumRadius, tiledGround.position, scene);
	camera.attachControl(canvas, false, false, 0);

	// control how close the camera can get to the focus point
	camera.lowerRadiusLimit = (1 / maximumZoom) * zoomScalingFactor + minimumRadius; //(minimumZoom / zoomScalingFactor) + minimumRadius;
	camera.upperRadiusLimit = (1 / minimumZoom) * zoomScalingFactor + minimumRadius; //(maximumZoom / zoomScalingFactor) + minimumRadius;

	// control how far up and down the camera can rotate
	camera.upperBetaLimit = Math.PI / 4;
	camera.lowerBetaLimit = Math.PI / 4;

	// controls easing of camera zoom and motion
	camera.inertia = 0.5;
	// controls power of mousewheel input
	camera.wheelDeltaPercentage = .0025;
	// controls how quickly the camera rotates around a point (higher is slower)
	camera.angularSensibilityX = 150;
	camera.angularSensibilityY = 100;

	camera.panningSensibility = 100;

	// var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(1000, 1000, 1000), scene);
	self.camera = camera;

	camera.setTarget(BABYLON.Vector3.Zero());
	// camera.attachControl(canvas, false);    //Not needed unless debuging in camera or for some other reason.            
	camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;


	// // should be made relagtive to canvas size
	// camera.orthoTop = canvas.height / 10; // 4.5; // top distance from zero
	// camera.orthoBottom = -canvas.height / 10; // -4.5 // bottom distance from zero
	// camera.orthoLeft = -canvas.width / 10; // -9 // left distance from zero
	// camera.orthoRight = canvas.width / 10; // 9 // right distance from zero


	// var dandelions = {};

	// var spriteManagerDandelion = new BABYLON.SpriteManager("dandelionManager", "sprite/dandelion.png", 1000, { width: 32, height: 32 }, scene, 0.01, BABYLON.Texture.NEAREST_SAMPLINGMODE);

	// var dandelionCount = 5;

	// var distributionRadius = 30;

	// for (var i = 0; i < dandelionCount; i++) {
	// 	var key = 'dandelion_' + i;
	// 	var dandelion = new BABYLON.Sprite(key, spriteManagerDandelion);

	// 	dandelion.position.x = Math.floor((Math.random() - 0.5) * distributionRadius);
	// 	dandelion.position.y = 0;
	// 	dandelion.position.z = Math.floor((Math.random() - 0.5) * distributionRadius);
	// 	var size = Math.random() * 0.5 + 0.5;
	// 	dandelion.size = size * spriteManagerDandelion.cellWidth / 8;
	// 	// dandelion.height = size * spriteManagerDandelion.cellHeight / 8;
	// 	dandelion.playAnimation(0, 1, true, 500);

	// 	dandelion.lastState = 0;

	// 	dandelions[key] = dandelion;

	// 	dandelions['lastID'] = i;

	// }

	// console.log(spriteManagerDandelion);

	// spriteManagerDandelion.sprites.splice(2, 1);

	// console.log(spriteManagerDandelion);


	// var light = new BABYLON.PointLight("pointLight", new BABYLON.Vector3(
	// 	0, 10, 0), scene);
	// light.diffuse = new BABYLON.Color3(1, 1, 1);


	scene.actionManager = new BABYLON.ActionManager(scene);
	scene.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction({
			trigger:
				BABYLON.ActionManager.OnKeyUpTrigger, parameter: " "
		},
			function () {
				light.setEnabled(!light.isEnabled());
			}
		));


	// var highlighter = new BABYLON.Mesh.CreateSphere("highlighter", 10, 0.2, scene, true, BABYLON.Mesh.DOUBLESIDE);
	// var highlighterMaterial = new BABYLON.StandardMaterial("Highlighter", scene);
	// highlighterMaterial.emissiveColor = new BABYLON.Color4(1, 1, 1);
	// highlighterMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
	// highlighterMaterial.alpha = 0.5;
	// highlighter.position = new BABYLON.Vector3(0, 0, 0);
	// highlighter.material = highlighterMaterial;
	// highlighter.isPickable = false;

	var currentHighlightIndex = 0;

	scene.onPointerObservable.add((pInfo) => {
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);

		if (pInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
			var pickResult = scene.pick(scene.pointerX, scene.pointerY);
			// if the click hits the ground object, we change the impact position
			if (pickResult.hit) {
				// highlighter.position.x = pickResult.pickedPoint.x;
				// highlighter.position.y = pickResult.pickedPoint.y;
				// highlighter.position.z = pickResult.pickedPoint.z;

				var i = pickResult.subMeshId;
				// console.log(pickResult);
				tiledGround.subMeshes[currentHighlightIndex].materialIndex = 0;
				tiledGround.subMeshes[i].materialIndex = 1;
				currentHighlightIndex = i;
			}
		}

		if (pInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {
			// if (pickResult.hit) {
			// 	var lastID = dandelions['lastID'];

			// 	var childKey = 'dandelion_' + (lastID + 1);

			// 	var dandelion = new BABYLON.Sprite(childKey, spriteManagerDandelion);

			// 	dandelion.position.x = Math.round(pickResult.pickedPoint.x);
			// 	dandelion.position.y = Math.round(pickResult.pickedPoint.y);
			// 	dandelion.position.z = Math.round(pickResult.pickedPoint.z);

			// 	var size = Math.random() * 0.4 + 0.1;

			// 	dandelion.size = size * spriteManagerDandelion.cellWidth / 8;

			// 	dandelion.playAnimation(0, 1, true, 500);

			// 	dandelion.lastState = 0;

			// 	dandelions[lastID] = dandelion;

			// 	dandelions['lastID'] = lastID;

			// }
		}
	});

	// scene.onPointerMove = function () {
	// 	var pickResult = scene.pick(scene.pointerX, scene.pointerY);
	// 	// if the click hits the ground object, we change the impact position
	// 	if (pickResult.hit) {
	// 		// highlighter.position.x = pickResult.pickedPoint.x;
	// 		// highlighter.position.y = pickResult.pickedPoint.y;
	// 		// highlighter.position.z = pickResult.pickedPoint.z;

	// 		var i = pickResult.subMeshId;
	// 		// console.log(pickResult);
	// 		tiledGround.subMeshes[currentHighlightIndex].materialIndex = 0;
	// 		tiledGround.subMeshes[i].materialIndex = 1;
	// 		currentHighlightIndex = i;
	// 	}
	// };

	// scene.onPointerPick = function (evt, pickResult) {
	// 	if (pickResult.hit) {
	// 		var lastID = dandelions['lastID'];

	// 		var childKey = 'dandelion_' + (lastID + 1);

	// 		var dandelion = new BABYLON.Sprite(childKey, spriteManagerDandelion);

	// 		dandelion.position.x = Math.round(pickResult.pickedPoint.x);
	// 		dandelion.position.y = Math.round(pickResult.pickedPoint.y);
	// 		dandelion.position.z = Math.round(pickResult.pickedPoint.z);

	// 		var size = Math.random() * 0.4 + 0.1;

	// 		dandelion.size = size * spriteManagerDandelion.cellWidth / 8;

	// 		dandelion.playAnimation(0, 1, true, 500);

	// 		dandelion.lastState = 0;

	// 		dandelions[lastID] = dandelion;

	// 		dandelions['lastID'] = lastID;

	// 	}
	// }

	scene.registerBeforeRender(function () {

		adjustOrthoCamera(camera, canvas, (camera.radius - minimumRadius) / zoomScalingFactor);

	});

	engine.runRenderLoop(function () {
		// if (Math.random() > 0.9) {
		// 	var i = Math.floor(Math.random() * tiledGround.subMeshes.length);
		// 	tiledGround.subMeshes[currentHighlightIndex].materialIndex = 0;
		// 	tiledGround.subMeshes[i].materialIndex = 1;
		// 	currentHighlightIndex = i;
		// }

		// var light = scene.getLightByName("pointLight");
		// light.diffuse.g += 0.01;
		// light.diffuse.b += 0.01;

		// adjustOrthoCamera(camera, canvas, minimumRadius - (camera.radius - camera.upperRadiusLimit) * zoomScalingFactor);
		
		
		// adjustOrthoCamera(camera, canvas, (camera.radius - minimumRadius) / zoomScalingFactor);
		
		
		// camera.panningSensibility = maximumZoom - (camera.radius - minimumRadius) / zoomScalingFactor;

		// var material = scene.getMeshByName("Box").material;
		// material.alpha -= 0.01;
		// if (material.alpha < 0) material.alpha = 1.0;

		// for (var key in dandelions) {
		// 	// dandelion's frame has changed to 1
		// 	if (dandelions[key].lastState == 0 && dandelions[key].cellIndex == 1) {
		// 		dandelions[key].lastState = 1;
		// 	}
		// 	// dandelion's frame has changed to 0
		// 	if (dandelions[key].lastState == 1 && dandelions[key].cellIndex == 0) {
		// 		dandelions[key].lastState = 0;
		// 		if (Math.random() > 0.95) {
		// 			dandelions[key].size += 1;
		// 		}
		// 	}

		// 	if (dandelions[key].size > 8) {

		// 		var dandelionCount = Math.random() * 4 + 1;

		// 		var distributionRadius = 5;

		// 		var lastID = dandelions['lastID'];

		// 		for (var i = lastID + 1; i < lastID + dandelionCount; i++) {
		// 			var childKey = 'dandelion_' + i;

		// 			var dandelion = new BABYLON.Sprite(childKey, spriteManagerDandelion);

		// 			dandelion.position.x = dandelions[key].position.x + Math.floor((Math.random() - 0.5) * distributionRadius);
		// 			dandelion.position.y = 0;
		// 			dandelion.position.z = dandelions[key].position.z + Math.floor((Math.random() - 0.5) * distributionRadius);
		// 			var size = Math.random() * 0.4 + 0.1;
		// 			dandelion.size = size * spriteManagerDandelion.cellWidth / 8;
		// 			// dandelion.height = size * spriteManagerDandelion.cellHeight / 8;
		// 			dandelion.playAnimation(0, 1, true, 500);

		// 			dandelion.lastState = 0;

		// 			dandelions[childKey] = dandelion;

		// 			dandelions['lastID'] = i;

		// 		}

		// 		dandelions[key].size = 1;
		// 	}
		// }

		scene.render();
	});

	// handle resizing window to ensure calculations based on
	// width and height stay consistent
	window.addEventListener('resize', function () {

		engine.resize();
		// should be made relagtive to canvas size
		// camera.orthoTop = canvas.height / 10; // 4.5; // top distance from zero
		// camera.orthoBottom = -canvas.height / 10; // -4.5 // bottom distance from zero
		// camera.orthoLeft = -canvas.width / 10; // -9 // left distance from zero
		// camera.orthoRight = canvas.width / 10; // 9 // right distance from zero

		adjustOrthoCamera(camera, canvas, 10);

	});




	return scene;

	// mesh = new SoftEngine.Mesh("Cube", 8);
	// meshes.push(mesh);
	// mera = new SoftEngine.Camera();
	// device = new SoftEngine.Device(canvas);
	// mesh.Vertices[0] = new BABYLON.Vector3(-1, 1, 1);
	// mesh.Vertices[1] = new BABYLON.Vector3(1, 1, 1);
	// mesh.Vertices[2] = new BABYLON.Vector3(-1, -1, 1);
	// mesh.Vertices[3] = new BABYLON.Vector3(-1, -1, -1);
	// mesh.Vertices[4] = new BABYLON.Vector3(-1, 1, -1);
	// mesh.Vertices[5] = new BABYLON.Vector3(1, 1, -1);
	// mesh.Vertices[6] = new BABYLON.Vector3(1, -1, 1);
	// mesh.Vertices[7] = new BABYLON.Vector3(1, -1, -1);
	// mera.Position = new BABYLON.Vector3(0, 0, 10);
	// mera.Target = new BABYLON.Vector3(0, 0, 0);
	// requestAnimationFrame(drawingLoop);
}

function adjustOrthoCamera(camera, canvas, zoom) {
	camera.orthoTop = canvas.height * zoom; // 4.5; // top distance from zero
	camera.orthoBottom = -canvas.height * zoom; // -4.5 // bottom distance from zero
	camera.orthoLeft = -canvas.width * zoom; // -9 // left distance from zero
	camera.orthoRight = canvas.width * zoom; // 9 // right distance from zero
}

// scene = createScene();


	// function drawingLoop() {
	//     device.clear();
	//     mesh.Rotation.x += 0.01;
	//     mesh.Rotation.y += 0.01;
	//     device.render(mera, meshes);
	//     device.present();
	//     requestAnimationFrame(drawingLoop);
	// }