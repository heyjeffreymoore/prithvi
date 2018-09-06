/*



*/

module.exports = function () {
	this.ActorManager = ActorManager;
}

function ActorManager() {

	return this;
}

ActorManager.prototype.firstUpdateTime = Date.now();

ActorManager.prototype.bounds = undefined;

ActorManager.prototype.lastID = 0;

// boxs: x_y_z ie. 10_0_123
// values: objects which contain actor classes with the update() method
// example: {1_2_3: {Dandelion_13}, 4_-6_1: {Rose_17, Worm_63}}
// each client will be in charge of a set list of cells and their actors
ActorManager.prototype.staff = {};


ActorManager.prototype.boxFromPosition = function (position) {
	return "" + Math.round(position.x) + "_" + Math.round(position.y) + "_" + Math.round(position.z);
}

ActorManager.prototype.hasActor = function (box, className) {
	return ActorManager.prototype.staff.hasOwnProperty(box) && ActorManager.prototype.staff[box].hasOwnProperty(className);
}

// the actor should already be crafted and positioned, or else its box will not be calculable
// for now, we don't want mutliple actors of the same class occupying the same space
// we may never wanted multiple actors occupying the same space, or we may want stacking/layers
ActorManager.prototype.hire = function (actor) {
	// actor should already have its box ready
	if (ActorManager.prototype.hasActor(actor.box, actor.className)) {
		return;
	}

	// need to add the box object if it doesn't exist
	if (!ActorManager.prototype.staff.hasOwnProperty[actor.box]) {
		ActorManager.prototype.staff[actor.box] = {};
	}

	ActorManager.prototype.staff[actor.box][actor.className] = actor;

	return actor;

}

// fire an actor, removing it from the scene without allowing it to die()
ActorManager.prototype.fire = function (box, className) {

	if (ActorManager.prototype.hasActor(box, className)) {
		delete ActorManager.prototype.staff[box][className];
		if (Object.keys(ActorManager.prototype.staff[box]).length < 1) {
			delete ActorManager.prototype.staff[box];
		}
		return true;
	}

	return false;

}