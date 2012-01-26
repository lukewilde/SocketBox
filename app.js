/**
 * Module dependencies.
 */

var express = require('express'),
		routes = require('./routes'),
		app = module.exports = express.createServer();

// Configuration
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});

// import socket IO.
var io = require('socket.io').listen(app);

app.get('/', routes.index);


io.sockets.on('connection', function (socket) {
	socket.broadcast.emit('user connected', {message : 'User connected'});
	
	socket.on('drop', function (data) {	
		socket.broadcast.emit('place ball', {x : data.x, y : data.y});
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
