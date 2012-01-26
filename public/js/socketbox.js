(function ($, Box2D){ 
	$.fn.socketbox = function() {

		var base = this;

		var scale = 30;
		var framerate = 60;
		var bodyDef;
		var fixDef;
		var world;
		var socket;

		// Box2D
		setupWorld();

		// Sockets
		setupSockets();
		
		// Stats
		setupStats();

		function setupWorld() {
			world = createWorld();
			createGround();
			// createLoadsaStuff(100);
			debugDraw();
			gameLoop();
			initInterface();
		}

		function setupStats() {
			var stats = new Stats();
			$(base).parent().append(stats.domElement);

			setInterval( function () {
				stats.update();
			}, 1000 / framerate );
		}

		function gameLoop() {
			setInterval(function(){
				update(); 
			}, 1000 / framerate);
		}

		function update() {
			world.Step(
				1 / framerate,   //frame-rate
				10,       //velocity iterations
				10       //position iterations
			);
			world.DrawDebugData();
			world.ClearForces();
		};

		function setupSockets() {
			socket = io.connect('http://localhost');
			socket.on('connection');
			socket.on('user connected', function(data) {
				jQuery('body').append('<p>' + data.message + '</p>');
			});
			socket.on('place ball', function(data) {
				createBall(data.x, data.y);
			});
		}

		function createWorld() {
			return new Box2D.Dynamics.b2World(
				new Box2D.Common.Math.b2Vec2(0, 10), 	//gravity
				true 								//allow sleep
			);
		}

		function createGround() {

			fixDef = new Box2D.Dynamics.b2FixtureDef;
			fixDef.density = 1.0;
			fixDef.friction = 0.5;
			fixDef.restitution = 0.2;

			bodyDef = new Box2D.Dynamics.b2BodyDef;
			bodyDef.type = Box2D.Dynamics.b2Body.b2_staticBody;

			// positions the center of the object (not upper left!)
			bodyDef.position.x = $(base).width() / 2 / scale;
			bodyDef.position.y = $(base).height() / scale;

			fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
			// Half width, half height.
			fixDef.shape.SetAsBox((600 / scale) / 2, (10 / scale) / 2);

			// Add to world
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		}

		function createLoadsaStuff(howManyThings) {
			bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;

			for(var i = 0; i < howManyThings; ++i) {
				if(Math.random() > 0.5) {
					fixDef.shape = new Box2D.Collision.Shapes.b2PolygonShape;
					fixDef.shape.SetAsBox(
						Math.random() + 0.1, //half width
						Math.random() + 0.1 //half height
					);
				} else {
					fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(
						Math.random() + 0.1 //radius
					);
				}
				bodyDef.position.x = Math.random() * 25;
				bodyDef.position.y = Math.random() * 10;

				world.CreateBody(bodyDef).CreateFixture(fixDef);
			}
		}

		function createBall(x, y) {
			bodyDef.type = Box2D.Dynamics.b2Body.b2_dynamicBody;
			bodyDef.position.x = x;
			bodyDef.position.y = y;

			fixDef.shape = new Box2D.Collision.Shapes.b2CircleShape(
				// Math.random() + 0.1 //radius
				1
			);

			return world.CreateBody(bodyDef).CreateFixture(fixDef);
		}

		function debugDraw() {
			var debugDraw = new Box2D.Dynamics.b2DebugDraw();
			debugDraw.SetSprite($(base)[0].getContext("2d"));
			debugDraw.SetDrawScale(scale);
			debugDraw.SetFillAlpha(0.3);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(Box2D.Dynamics.b2DebugDraw.e_shapeBit | Box2D.Dynamics.b2DebugDraw.e_jointBit);
			world.SetDebugDraw(debugDraw);
		}

		function initInterface() {
			$(base).click(function(event){
				createBall(getMouseX(event), getMouseY(event));

				// To server
				socket.emit('drop', { x: getMouseX(event), y: getMouseY(event) });
			});
		}

		function getMouseX(event) {
			return (event.pageX - base[0].offsetLeft) / scale;
		}

		function getMouseY(event) {
			return (event.pageY - base[0].offsetTop) / scale;
		}
	}
}(jQuery, Box2D));