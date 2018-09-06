// http://eloquentjavascript.net/1st_edition/chapter8.html

/*



*/

require('./ActorManager.js')();

module.exports = function () {
	this.Actor = Actor;
}




// Constructor




function Actor(className, position, properties) {

	this.className = className;

	// position determines the box the actor will live in
	this.position = position;

	// this should parse the key-value pairs into the actor's object
	for (var key in properties) {
		this[key] = properties[key];
	}

	// box will be set when this object is handled by the ActorManager
	// this might be too coupled
	this.box = ActorManager.prototype.boxFromPosition(this.position);
	this.name = className + '_' + Actor.prototype.lastID;

	// puts this actor on the stage. again, might be too coupled
	var A = ActorManager.prototype.hire(this);

	if (!A) {
		return;
	}

	this.hired = true;

	Actor.prototype.lastID++;

	return this;
}

Actor.prototype.propose = function (className, position, properties) {

	var D = new Actor(className, position, properties);

	if (D.hired) {
		return D;
	}

	return undefined;
}



// Properties




const state = {
	GROWING: 0,
	SEEDING: 1
}

Actor.prototype.STATE = state;

// lastID keeps a running count of all objects of this class
Actor.prototype.lastID = 1;




// Methods




Actor.prototype.proliferate = function (count, distributionRadius, resign) {

	for (var i = 0; i < count; i++) {
		var position = new BABYLON.Vector3(
			this.sprite.position.x + Math.round((Math.random() - 0.5) * 2 * distributionRadius),
			this.sprite.position.y,
			this.sprite.position.z + Math.round((Math.random() - 0.5) * 2 * distributionRadius)
		);

		if (ActorManager.prototype.bounds.intersectsPoint(position)) {
			var dandelion = new Actor(
				this.spriteManager,
				Math.random() * 0.4 + 0.4,
				position
			);
		}
	}

	if (resign) {
		this.resign();
	}

	return;

}

Actor.prototype.marco = function () {
	return 'polo: ' + this.name + " " + this.box;
}

// request retirement from ActorManager
Actor.prototype.resign = function () {
	ActorManager.prototype.retire(this.box);
}

Actor.prototype.retire = function (box) {
	// do some stuff before being retired from service forever
}

Actor.prototype.getPosition = function () {

	return this.position;

}


Actor.prototype.update = function () {

	// dandelion's frame has changed to 1
	if (this.lastState == 0 && this.sprite.cellIndex == 1) {

		this.lastState = 1;

	}

	// dandelion's frame has changed to 0
	if (this.lastState == 1 && this.sprite.cellIndex == 0) {

		this.lastState = 0;

		if (Math.random() > 0.75) {
			this.sprite.size += 0.25;
		}

	}

	if (this.sprite.size > 3 && this.deathRattle < 0) {
		this.sprite.size -= 0.5;
		this.animate(2, 3, 250);
		this.lastState = 2;
		this.deathRattle = 0;
	}

	// dandelion's frame has changed to 1
	if (this.lastState % 2 == 0 && this.sprite.cellIndex % 2 == 1) {

		this.lastState++;

	}

	// dandelion's frame has changed to 0
	if (this.lastState % 2 == 1 && this.sprite.cellIndex % 2 == 0) {

		this.lastState++;

		this.deathRattle++;

		this.animate(2 + this.deathRattle * 2, 3 + this.deathRattle * 2, 250);

		this.proliferate(1, 3);

	}

	if (this.deathRattle > 3) {
		this.resign();
	}


	return;
}