var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require('crypto');
var seedrandom = require('seedrandom');
var colors = require('colors');

require('./class/ActorManager')();
require('./class/Actor')();

// app.get('/', function (req, res) {
// 	res.sendFile(__dirname + '/client/index.html')
// 	// console.log('received a request');
// });

/* serves all the static files */
app.get(/^(.+)$/, function (req, res) {
	console.log('static file request : ' + req.params[0]);
	res.sendFile(__dirname + '/client/' + req.params[0]);
});

var updatePeriod = 50;

// key: p_x_y
// value: true|false
var boxes = {};

// key: socketID
var clients = {};

// player object
// name
// position {x, y}

// console.log(ActorManager.prototype.staff);

// console.log(seedrandom('test'));

io.on('connection', function (socket) {

	console.log('someone connected from ' + socket.request.connection.remoteAddress + ' with id ' + socket.id);

	// need to send client verification to add clients, since sometimes weird connections get added
	socket.emit('marco', function (data) {
		if (data == 'polo') {
			console.log('polo from ' + socket.id);
			clients[socket.id] = {};

			// recalculate update responsibilities
			updateAssignments();
		}
	});

	for (var box in ActorManager.prototype.staff) {
		for (var className in ActorManager.prototype.staff[box]) {
			var digest = getHash(ActorManager.prototype.staff[box][className].name);
			socket.emit('spawn approved', [box, className, digest].join('>>>'));
		}
	}

	socket.on('disconnect', function () {
		console.log('someone disconnected from ' + socket.request.connection.remoteAddress + ' with id ' + socket.id);
		delete clients[socket.id];

		// recalculate update responsibilities
		updateAssignments();
	});

	// msg format
	// x_y_z>>>className
	socket.on('spawn request', function (msg) {

		var parts = ('' + msg).split('>>>', 2);

		var box = parts[0];
		var className = parts[1]

		var coords = ('' + box).split('_', 3);

		// logMessage('requesting new ' + coords[3] + ' at ( ' + coords[0] + ', ' + coords[1] + ', ' + coords[2] + ' ) on beat ' + getBeat(500), socket);

		var actor = Actor.prototype.propose(
			className,
			{ x: coords[0], y: coords[1], z: coords[2] },
			{
				size: 1,
				deathRattle: -1,
				lastState: 0
			}
		);

		if (actor) {
			// should be salted with something I guess?
			var digest = getHash(actor.name);

			// var number = parseInt('0x' + digest.substring(3, 5)) / 256.0;
			// console.log('>>> approved! new fatestring is ' + digest + ' and here\'s a number ' + number);

			socket.emit('spawn approved', [actor.box, actor.className, digest].join('>>>'));
			var handled = {};
			handled[actor.box] = actor;
			socket.emit('add handled', handled);
			socket.broadcast.emit('spawn approved', [actor.box, actor.className, digest].join('>>>'));

		} else {
			console.warn((box + ' already has a ' + className).yellow);
		}

	});

	// msg format
	// x_y_z>>>className
	socket.on('despawn request', function (msg) {

		var parts = ('' + msg).split('>>>', 2);

		var box = parts[0];
		var className = parts[1]

		var coords = ('' + box).split('_', 3);

		// logMessage('requesting despawn of ( ' + key + ' ) on beat ' + getBeat(500), socket);

		if (ActorManager.prototype.fire(box, className)) {
			// console.log('>>> approved!');
		} else {
			console.warn((box + ' doesn\'t have a ' + className).yellow)
		}

		socket.emit('despawn approved', [box, className].join('>>>'));
		socket.broadcast.emit('despawn approved', [box, className].join('>>>'));

	});

	// msg format
	// modulo
	socket.on('sync beat', function (msg) {

		logMessage('sync beat request. returning ' + getBeat(parseInt(msg)), socket);

		socket.emit('sync beat', getBeat(parseInt(msg)));

	});

	socket.on('sync time', function () {

		logMessage('sync time request. returning ' + serverStartTime + '>>>' + Date.now(), socket);

		socket.emit('sync time', serverStartTime + '>>>' + Date.now());

	});


});



http.listen(8080, function () {
	console.log('listening on *:8080');
});





// var updateAssignments = function () {
// 	var roundRobin = 0;
// 	var clientKeys = Object.keys(clients);
// 	var assignments = {};

// 	for (var key in clients) {
// 		assignments[key] = new Array();
// 	}

// 	for (var key in ActorManager.prototype.staff) {
// 		assignments[clientKeys[roundRobin % clientKeys.length]].push(ActorManager.prototype.staff[key]);
// 		roundRobin++;
// 	}

// 	console.log(assignments);
// }


var updateAssignments = function () {
	var roundRobin = 0;
	var clientKeys = Object.keys(clients);

	if (clientKeys.length < 1) {
		return;
	}

	var assignments = {};

	for (var key in clients) {
		assignments[key] = {};
	}

	for (var key in ActorManager.prototype.staff) {
		assignments[clientKeys[roundRobin % clientKeys.length]][key] = ActorManager.prototype.staff[key];
		roundRobin++;
	}

	for (var key in assignments) {
		io.to(`${key}`).emit('update handled', assignments[key]);
	}

}


var getHash = function (str) {
	var hash = crypto.createHash('sha256');
	hash.update(str);
	return hash.digest('hex');
}

var serverStartTime = Date.now();


var getBeat = function (modulo) {

	return (Date.now() - serverStartTime) / modulo;
}

var logMessage = function (msg, socket) {
	console.log('[' + socket.id + '] ' + msg);

}