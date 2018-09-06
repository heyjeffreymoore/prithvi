/*

	todo:

	frame/event sync:

	waitFor {
	
		_250_beat: {
			3_0_-18_Dandelion: function () { animate(2, 3, 250); }
			8_0_17_Dandelion: function () { animate(2, 3, 250); }
			12_0_-1_Dandelion: function () { animate(2, 3, 250); }
		}

		_500_beat: {
			4_0_10_Dandelion: function () { animate(0, 1, 500); }
			7_0_12_Dandelion: function () { animate(0, 1, 500); }
			-5_0_21_Dandelion: function () { animate(0, 1, 500); }
		}

		// requires ClientActorManager.prototype.midiHit = false; which can be modified externally, and turned off when the hit is dealt with.
		_midi_hit: {
			4_0_10_Dandelion: function () { animate(0, 1, 500, midi); }
			6_0_17_Dandelion: function () { animate(0, 1, 500, midi); }
			-4_0_-8_Dandelion: function () { animate(0, 1, 500, midi); }
		}

	}

	for (var beatKey in waitFor) {
		modulo = beatKey.split('_')[0];
		if(isBeatFrame(modulo)) {
			for (var key in waitFor[beatKey]) {
				// do this thing
			}
		}
	}

*/

function ClientActorManager() {

	return this;
}

ClientActorManager.prototype.firstUpdateTime = Date.now();
ClientActorManager.prototype.lastUpdateTime = Date.now();
ClientActorManager.prototype.currentUpdateTime = Date.now();

ClientActorManager.prototype.bounds = undefined;

// keys: x_y_z ie. 10_0_123
// values: objects which contain actor classes with the update() method
// example: {1_2_3: {Dandelion_13}, 4_-6_1: {Rose_17, Worm_63}}
// each client will be in charge of a set list of cells and their actors
ClientActorManager.prototype.staff = {};

ClientActorManager.prototype.handledBoxes = {};

ClientActorManager.prototype.updateHandled = function () {

	ClientActorManager.prototype.lastUpdateTime = ClientActorManager.prototype.currentUpdateTime;
	ClientActorManager.prototype.currentUpdateTime = Date.now();

	var beat = 0;
	if (beat = ClientActorManager.prototype.isBeatFrame(500)) {

		ClientActorManager.prototype.onBeat();
		// console.log(beat);

	}

	for (var box in ClientActorManager.prototype.handledBoxes) {

		for (var className in ClientActorManager.prototype.staff[box]) {
			ClientActorManager.prototype.staff[box][className].update();
		}

	}

	return;

}

ClientActorManager.prototype.updateAll = function () {

	ClientActorManager.prototype.lastUpdateTime = ClientActorManager.prototype.currentUpdateTime;
	ClientActorManager.prototype.currentUpdateTime = Date.now();

	var beat = 0;
	if (beat = ClientActorManager.prototype.isBeatFrame(500)) {

		ClientActorManager.prototype.onBeat();
		// console.log(beat);

	}

	for (var box in ClientActorManager.prototype.staff) {

		for (var className in ClientActorManager.prototype.staff[box]) {
			ClientActorManager.prototype.staff[box][className].update();
		}

	}

	return;

}

ClientActorManager.prototype.onBeat = function () {
	return;
}

ClientActorManager.prototype.boxFromPosition = function (position) {
	return "" + Math.round(position.x) + "_" + Math.round(position.y) + "_" + Math.round(position.z);
}

ClientActorManager.prototype.hasActor = function (box, className) {
	return ClientActorManager.prototype.staff.hasOwnProperty(box) && ClientActorManager.prototype.staff[box].hasOwnProperty(className);
}

// the actor should already be crafted and positioned, or else its box will not be calculable
ClientActorManager.prototype.hire = function (actor, actionOnRedundancy) {

	// actor should already have its box ready
	if (ClientActorManager.prototype.hasActor(actor.box, actor.className)) {
		return;
	}

	// need to add the box object if it doesn't exist
	if (!ClientActorManager.prototype.staff.hasOwnProperty[actor.box]) {
		ClientActorManager.prototype.staff[actor.box] = {};
	}

	ClientActorManager.prototype.staff[actor.box][actor.className] = actor;

	return actor;

}

// fire an actor, removing it from the scene without allowing it to die()
ClientActorManager.prototype.fire = function (box, className) {

	if (ClientActorManager.prototype.hasActor(box, className)) {
		ClientActorManager.prototype.staff[box][className].mesh.dispose();

		delete ClientActorManager.prototype.staff[box][className];

		return true;
	}

	return false;

}

// retires an actor, usually allowing it to die() and then removing it from the scene
ClientActorManager.prototype.retire = function (box, className) {

	if (ClientActorManager.prototype.hasActor(box, className)) {

		ClientActorManager.prototype.staff[box][className].retire();

		ClientActorManager.prototype.fire(box, className);

		return true;
	}

	return false;
}

// we may want to check if this frame is a beat based on modulo milliseconds
// the logic is if last time was 499 and this time is 501, modulo 500 turns that into 499 > 1
ClientActorManager.prototype.isBeatFrame = function (modulo) {
	return (ClientActorManager.prototype.lastUpdateTime % modulo > ClientActorManager.prototype.currentUpdateTime % modulo) ? ClientActorManager.prototype.getBeatCount(modulo) : false;
}

// it may also be helpful when dealing with the server to keep track of how many beats have elapsed to keep everyone synced up
ClientActorManager.prototype.getBeatCount = function (modulo) {
	return (ClientActorManager.prototype.currentUpdateTime - ClientActorManager.prototype.firstUpdateTime) / modulo;
}

// // returns a random value gotten from a substring of the fateString based on the fateIndex and the precision
// ClientActorManager.prototype.randomFate = function (avatar, precision) {
// 	avatar.fateIndex += precision;
// 	return parseInt('0x' + (avatar.fateString + avatar.fateString).substring(avatar.fateIndex, avatar.fateIndex + precision % avatar.fateString.length)) / Math.pow(16.0, precision % avatar.fateString.length);
// }