(function ($){ 
	$.fn.socketbox = function() {

		var base = this;

		// Box2D
		setupWorld();

		// Sockets
		setupSockets();

		function setupWorld() {
			var world = createWorld();
			createGround(world);
			createLoadsaStuff(world);
			debugDraw();
		}

		function setupSockets() {
			var socket = io.connect('http://localhost');
			socket.on('connection');
			socket.on('user connected', function (data) {
				jQuery('body').append('<p>' + data.message + '</p>');

				// fire new events
				// socket.emit('server side event', { my: 'data' });
			});
		}

		function createWorld() {
			return new b2World(
				new b2Vec2(0, 10), 	//gravity
				true 								//allow sleep
			);
		}

		function createGround(world) {

			var fixDef = new b2FixtureDef;
			fixDef.density = 1.0;
			fixDef.friction = 0.5;
			fixDef.restitution = 0.2;

			var bodyDef = new b2BodyDef;
			bodyDef.type = b2Body.b2_staticBody;
			// Positions the center of the object (not upper left!)
			bodyDef.position.x = CANVAS_WIDTH / 2 / SCALE;
			bodyDef.position.y = CANVAS_HEIGHT / SCALE;

			fixDef.shape = new b2PolygonShape;
			// Half width, half height.
			fixDef.shape.SetAsBox((600 / SCALE) / 2, (10/SCALE) / 2);

			// Add to world
			world.CreateBody(bodyDef).CreateFixture(fixDef);
		}

		function createLoadsaStuff(world) {
			bodyDef.type = b2Body.b2_dynamicBody;

			for(var i = 0; i < 10; ++i) {
				if(Math.random() > 0.5) {
					fixDef.shape = new b2PolygonShape;
					fixDef.shape.SetAsBox(
						Math.random() + 0.1, //half width
						Math.random() + 0.1 //half height
					);
				} else {
					fixDef.shape = new b2CircleShape(
						Math.random() + 0.1 //radius
					);
				}
				bodyDef.position.x = Math.random() * 25;
				bodyDef.position.y = Math.random() * 10;
				world.CreateBody(bodyDef).CreateFixture(fixDef);
			}
		}

		function createBall(world, x, y) {
			var ballSd = new b2CircleDef();
			ballSd.density = 1.0;
			ballSd.radius = 20;
			ballSd.restitution = 0.6;
			ballSd.friction = 0.4;
			var ballBd = new b2BodyDef();
			ballBd.AddShape(ballSd);
			ballBd.position.Set(x,y);
			return world.CreateBody(ballBd);
		}

		function createBox(world, x, y, width, height, fixed) {
			if (typeof(fixed) == 'undefined') fixed = true;
			var boxSd = new b2BoxDef();
			boxSd.restitution = 0.6;
			boxSd.friction = .3;
			if (!fixed) boxSd.density = 1.0;
			boxSd.extents.Set(width, height);
			var boxBd = new b2BodyDef();
			boxBd.AddShape(boxSd);
			boxBd.position.Set(x,y);
			return world.CreateBody(boxBd)
		}	

		function debugDraw() {
			var debugDraw = new b2DebugDraw();
			debugDraw.SetSprite($(base).getContext("2d"));
			debugDraw.SetDrawScale(SCALE);
			debugDraw.SetFillAlpha(0.3);
			debugDraw.SetLineThickness(1.0);
			debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
			world.SetDebugDraw(debugDraw);
		}
	}
}(jQuery));