// http://eloquentjavascript.net/1st_edition/chapter8.html

/*



*/

function Dandelion(position, size) {

	// box will be set when this object is handled by the ClientActorManager
	this.box = ClientActorManager.prototype.boxFromPosition(position);
	this.className = 'Dandelion';

	// name should probably be inherited from the server
	this.name = this.className + '_' + Dandelion.prototype.lastID;

	// puts this actor on the stage. again, might be too coupled
	var A = ClientActorManager.prototype.hire(this);

	if (!A) {
		return;
	}

	this.resigned = false;

	this.lastState = 0;

	this.deathRattle = -1;

	// lastID keeps a running count of all objects of this class
	Dandelion.prototype.lastID++;

	// every avatar must have a mesh to be destroyed from the renderer
	this.mesh = this.sprite = new BABYLON.Sprite(this.name, Dandelion.prototype.spriteManager);


	// this should be a call that sets this object into the ClientActorManager
	this.sprite.position = position;

	this.sprite.size = size; // * spriteManager.cellWidth / 8;

	this.animate(0, 1, 500);

	this.sprite.avatar = this;

	// puts this avatar on the stage
	ClientActorManager.prototype.hire(this, 0);

	return this;
}

Dandelion.prototype.spriteManager = {};

Dandelion.prototype.lastID = 1;

Dandelion.prototype.proliferate = function (count, distributionRadius) {

	for (var i = 0; i < count; i++) {
		var position = new BABYLON.Vector3(
			parseInt(this.sprite.position.x) + Math.round((Math.random() - 0.5) * 2 * distributionRadius),
			parseInt(this.sprite.position.y),
			parseInt(this.sprite.position.z) + Math.round((Math.random() - 0.5) * 2 * distributionRadius)
		);

		if (ClientActorManager.prototype.bounds.intersectsPoint(position)) {

			NetworkManager.prototype.propose(
				position,
				'Dandelion'
			);

			// var dandelion = new Dandelion(
			// 	Math.random() * 0.4 + 0.4,
			// 	position
			// );
		}
	}

	// if (resign) {
	// 	NetworkManager.prototype.pinkslip(
	// 		thposition,
	// 		'Dandelion'
	// 	);
	// }

	return;

}

// request retirement from ClientActorManager
Dandelion.prototype.resign = function () {

	if (!this.resigned) {
		NetworkManager.prototype.pinkslip(
			this.sprite.position,
			'Dandelion'
		);
		this.resigned = true;
	}

	// ClientActorManager.prototype.retire(this.box);
}

Dandelion.prototype.retire = function (box) {
	// do some stuff before being retired from service forever
}

Dandelion.prototype.getPosition = function () {

	return this.sprite.position;

}

// by setting animate to run once and then call itself again, I can force it to sync up with an external clock
Dandelion.prototype.animate = function (start, stop, delay) {
	var d = this;
	this.sprite.playAnimation(
		start,
		stop,
		false,
		delay,
		function () {
			d.animate(start, stop, delay);
		}
	);
}

Dandelion.prototype.update = function () {

	if (this.resigned) {
		return;
	}

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