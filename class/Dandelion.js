// http://eloquentjavascript.net/1st_edition/chapter8.html

/*



*/

require('./ActorManager.js')();

module.exports = function () {
	this.Dandelion = Dandelion;
}




// Constructor




function Dandelion(position, size) {

	this.position = position;

	this.size = size;

	// key will be set when this object is handled by the ActorManager
	this.key = ActorManager.prototype.keyFromActorAndPosition(this, position);
	this.name = 'dandelion_' + Dandelion.prototype.lastID;

	// puts this actor on the stage
	var A = ActorManager.prototype.hire(this, 0);
	if (!A) {
		return;
	}

	this.hired = true;

	this.lastState = 0;

	this.deathRattle = -1;

	Dandelion.prototype.lastID++;

	return this;
}

Dandelion.prototype.propose = function (position, size) {

	var D = new Dandelion(position, size);

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

Dandelion.prototype.STATE = state;

// lastID keeps a running count of all objects of this class
Dandelion.prototype.lastID = 1;




// Methods




Dandelion.prototype.proliferate = function (count, distributionRadius, resign) {

	for (var i = 0; i < count; i++) {
		var position = new BABYLON.Vector3(
			this.sprite.position.x + Math.round((Math.random() - 0.5) * 2 * distributionRadius),
			this.sprite.position.y,
			this.sprite.position.z + Math.round((Math.random() - 0.5) * 2 * distributionRadius)
		);

		if (ActorManager.prototype.bounds.intersectsPoint(position)) {
			var dandelion = new Dandelion(
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

Dandelion.prototype.marco = function () {
	return 'polo: ' + this.name + " " + this.key;
}

// request retirement from ActorManager
Dandelion.prototype.resign = function () {
	ActorManager.prototype.retire(this.key);
}

Dandelion.prototype.retire = function (key) {
	// do some stuff before being retired from service forever
}

Dandelion.prototype.getPosition = function () {

	return this.position;

}


Dandelion.prototype.update = function () {

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