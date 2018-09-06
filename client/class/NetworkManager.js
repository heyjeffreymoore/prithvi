/*

*/

function NetworkManager() {

	return this;
}

NetworkManager.prototype.server = {};

NetworkManager.prototype.socket = io();

NetworkManager.prototype.serverStartTime = 0;
NetworkManager.prototype.serverTimeOffset = 0;

NetworkManager.prototype.getBeat = function () {

	return;

}


NetworkManager.prototype.propose = function (position, className) {
	NetworkManager.prototype.socket.emit('spawn request', [position.x, position.y, position.z].join('_') + '>>>' + className);
}

NetworkManager.prototype.pinkslip = function (position, className) {
	NetworkManager.prototype.socket.emit('despawn request', [position.x, position.y, position.z].join('_') + '>>>' + className);
}

// msg format:
// x_y_z>>>className
NetworkManager.prototype.spawn = function (msg) {

	var parts = ('' + msg).split('>>>', 3);

	var box = parts[0];
	var className = parts[1];

	var coords = ('' + box).split('_', 3);

	// make this spawn something specific depending on the class
	var avatar = new Dandelion(
		{ x: parseInt(coords[0]), y: parseInt(coords[1]), z: parseInt(coords[2]) },
		1
	);

}

// msg format:
// x_y_z>>>className
NetworkManager.prototype.despawn = function (msg) {

	var parts = ('' + msg).split('>>>', 3);

	var box = parts[0];
	var className = parts[1];

	var coords = ('' + box).split('_', 3);

	ClientActorManager.prototype.fire(box, className);

}

NetworkManager.prototype.updateHandledBoxes = function (msg) {
	console.log(msg);
	ClientActorManager.prototype.handledBoxes = msg;
}

NetworkManager.prototype.addHandledBoxes = function (msg) {
	for (var key in msg) {
		ClientActorManager.prototype.handledBoxes[key] = msg[key];
	}
}

// TODO:
// Handle update, etc.