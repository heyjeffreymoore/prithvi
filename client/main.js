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




	// Network




	var socket = NetworkManager.prototype.socket = io();

	$('form').submit(function () {
		socket.emit('chat message', $('#m').val());
		$('#m').val('');
		return false;
	});

	socket.on('marco', function (fn) {
		fn('polo');
	});

	socket.on('update handled', function (msg) {
		console.log(msg);
		NetworkManager.prototype.updateHandledBoxes(msg);
	});

	socket.on('add handled', function (msg) {
		NetworkManager.prototype.addHandledBoxes(msg);
	});

	socket.emit('sync time');

	socket.on('sync time', function (msg) {
		var parts = ('' + msg).split('>>>', 2);

		var start = parts[0];
		var now = parts[1];

		NetworkManager.prototype.serverStartTime = new Date(parseInt(start));
		NetworkManager.prototype.serverTimeOffset = Date.now() - new Date(parseInt(now));

		console.log('server start: ' + NetworkManager.prototype.serverStartTime + '; server offset: ' + NetworkManager.prototype.serverTimeOffset);
	});

	socket.on('spawn approved', function (msg) {

		NetworkManager.prototype.spawn(msg);

	});

	socket.on('despawn approved', function (msg) {

		NetworkManager.prototype.despawn(msg);

	});




	// Canvas




	canvas = document.getElementById("frontBuffer");

	engine = new BABYLON.Engine(canvas, true);

	scene = new BABYLON.Scene(engine);
	scene.clearColor = new BABYLON.Color3.Black();




	// Ground




	// Part 1 : Creation of Tiled Ground
	// Parameters
	var xmin = -8;
	var zmin = -8;
	var xmax = 8;
	var zmax = 8;
	var precision = {
		"w": 1,
		"h": 1
	};
	var subdivisions = {
		'h': zmax - zmin,
		'w': xmax - xmin
	};

	// Create the Tiled Ground
	var tiledGround = new BABYLON.Mesh.CreateTiledGround("Tiled Ground", xmin, zmin, xmax, zmax, subdivisions, precision, scene, true);
	tiledGround.position.x = 0.5;
	tiledGround.position.z = 0.5;

	ClientActorManager.prototype.bounds = new BABYLON.BoundingBox(new BABYLON.Vector3(xmin + 0.5, -100, zmin + 0.5), new BABYLON.Vector3(xmax + 0.5, 100, zmax + 0.5));

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




	// Camera




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




	// Objects




	var spriteManagerDandelion = new BABYLON.SpriteManager("dandelionManager", "sprite/dandelion.png", 1000, { width: 32, height: 32 }, scene, 0.01, BABYLON.Texture.NEAREST_SAMPLINGMODE);
	Dandelion.prototype.spriteManager = spriteManagerDandelion;

	var dandelionCount = 0;

	var distributionDiameter = xmax - xmin - 2;

	for (var i = 0; i < dandelionCount; i++) {

		NetworkManager.prototype.propose(
			new BABYLON.Vector3(
				Math.floor((Math.random() - 0.5) * distributionDiameter),
				0,
				Math.floor((Math.random() - 0.5) * distributionDiameter)
			),
			'Dandelion'
		);

		// var dandelion = new Dandelion(
		// 	new BABYLON.Vector3(
		// 		Math.floor((Math.random() - 0.5) * distributionDiameter),
		// 		0,
		// 		Math.floor((Math.random() - 0.5) * distributionDiameter)
		// 	),
		// 	Math.random() * 0.5 + 0.5
		// );

	}




	// Input




	scene.actionManager = new BABYLON.ActionManager(scene);
	scene.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(
			{
				trigger: BABYLON.ActionManager.OnKeyUpTrigger, parameter: " "
			},
			function () {
				NetworkManager.prototype.socket.emit('sync time');

				// ClientActorManager.prototype.socket
				// for (var key in ClientActorManager.prototype.staff) {
				// 	ClientActorManager.prototype.staff[key].sprite.cellIndex = 0;
				// 	// ClientActorManager.prototype.retire(key);
				// }
			}
		));


	var currentHighlightIndex = 0;

	scene.onPointerObservable.add((pInfo) => {
		var pickResult = scene.pick(scene.pointerX, scene.pointerY);

		if (pInfo.type === BABYLON.PointerEventTypes.POINTERMOVE) {
			var pickResult = scene.pick(scene.pointerX, scene.pointerY);
			// if the click hits the ground object, we change the impact position
			if (pickResult.hit) {

				var i = pickResult.subMeshId;
				// console.log(pickResult);
				tiledGround.subMeshes[currentHighlightIndex].materialIndex = 0;
				tiledGround.subMeshes[i].materialIndex = 1;
				currentHighlightIndex = i;
			}
		}

		if (pInfo.type === BABYLON.PointerEventTypes.POINTERPICK) {

			NetworkManager.prototype.propose(
				new BABYLON.Vector3(
					Math.round(pickResult.pickedPoint.x),
					Math.round(pickResult.pickedPoint.y),
					Math.round(pickResult.pickedPoint.z)
				),
				'Dandelion'
			);

			// var dandelion = new Dandelion(
			// 	Math.random() * 0.4 + 0.1,
			// 	new BABYLON.Vector3(
			// 		Math.round(pickResult.pickedPoint.x),
			// 		Math.round(pickResult.pickedPoint.y),
			// 		Math.round(pickResult.pickedPoint.z)
			// 	)
			// );

		}
	});




	// Game Loop




	scene.registerBeforeRender(function () {

		adjustOrthoCamera(camera, canvas, (camera.radius - minimumRadius) / zoomScalingFactor);

		// ClientActorManager.prototype.updateAll();
		ClientActorManager.prototype.updateHandled();

	});

	engine.runRenderLoop(function () {
		scene.render();
	});




	// Etc.




	// handle resizing window to ensure calculations based on
	// width and height stay consistent
	window.addEventListener('resize', function () {

		engine.resize();

		adjustOrthoCamera(camera, canvas, (camera.radius - minimumRadius) / zoomScalingFactor);

	});

	function adjustOrthoCamera(camera, canvas, zoom) {
		camera.orthoTop = canvas.height * zoom; // 4.5; // top distance from zero
		camera.orthoBottom = -canvas.height * zoom; // -4.5 // bottom distance from zero
		camera.orthoLeft = -canvas.width * zoom; // -9 // left distance from zero
		camera.orthoRight = canvas.width * zoom; // 9 // right distance from zero
	}

	return scene;

}


