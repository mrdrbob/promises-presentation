(function (r, animations, deferred) {
	var MapColumns = 20;
	var MapRows = 12;
	var TileWidth = 16;
	var TileHeight = 16;
	var SpriteSheet = new Image();

	SpriteSheet.src = '/assets/sheet.png';

	// decompose animations for easy access
	var delay = animations.delay;
	var moveTo = function(col, row, timeout) {
		return animations.moveTo(
			(col * TileWidth),
			(row * TileHeight),
			timeout
		);
	};
	var fadeAndMoveTo = function(alpha, col, row, timeout) {
		return animations.fadeAndMoveTo(
			alpha,
			(col * TileWidth),
			(row * TileHeight),
			timeout
		);
	};
	var fadeTo = animations.fadeTo;
	var animate = animations.animate;
	var waitForIt = animations.waitForIt;
	var manyTimes = animations.manyTimes;

	/*var animateSpriteDuring = function (steps, fps, until) {
		var correctedSteps = [];
		for(var x = 0, m = steps.length; x < m; x++) {
			var step = ObjectKey[steps[x]];
			correctedSteps[x] = [
				step[0] * -TileWidth,
				step[1] * -TileHeight
			];
		}

		return animations.animateSpriteDuring(correctedSteps, fps, until);
	};*/
	var animateSprite = function(steps, time) {
		var correctedSteps = [];
		for(var x = 0, m = steps.length; x < m; x++) {
			var step = ObjectKey[steps[x]];
			correctedSteps[x] = [
				step[0] * -TileWidth,
				step[1] * -TileHeight
			];
		}

		return animations.animateSprite(correctedSteps, time);
	};

	var LevelOne =  '' +
	'XXXXXXXXXXXXXXXXXXXX' +
	'XX{_____}XXXXXXXXXXX' +
	'XX[=====]XXXXXXXXXXX' +
	'XX|     ,________}XX' +
	'XX|     <========]XX' +
	'XX|              /XX' +
	'XX|              /XX' +
	"XX`--------------'XX" +
	'XXXXXXXXXXXXXXXXXXXX' +
	'XXXXXXXXXXXXXXXXXXXX' +
	'XXXXXXXXXXXXXXXXXXXX';

	var LevelThree =  '' +
	'XXXXXXXXXXXXXXXXXXXX' +
	'XX{_____}XXXXXXXXXXX' +
	'XX[=====]XXXXXXXXXXX' +
	'XX|     /XXX{____}XX' +
	'XX|     /XXX[====]XX' +
	'XX|     ,___.    /XX' +
	'XX|     <===>    /XX' +
	"XX`--------------'XX" +
	'XXXXXXXXXXXXXXXXXXXX' +
	'XXXXXXXXXXXXXXXXXXXX' +
	'XXXXXXXXXXXXXXXXXXXX';

	var ObjectKey = {
		'X': [1, 1],

		// {_}
		// [=]
		// | /
		// `-'
		'{': [5, 0],
		'_': [6, 0],
		'}': [7, 0],
		'[': [5, 1],
		'=': [6, 1],
		']': [7, 1],
		'|': [5, 2],
		'/': [7, 2],
		'`': [5, 3],
		'-': [6, 3],
		'\'': [7, 3],

		// ()
		// :;
		// ,.
		'(': [8, 0],
		')': [9, 0],
		':': [8, 1],
		';': [9, 1],
		',': [8, 2],
		'.': [9, 2],
		'<': [8, 3],
		'>': [9, 3],


		' ': null,

		'DOOR': [4, 6],
		'DOOR-3': [3, 6],
		'DOOR-2': [2, 6],
		'DOOR-1': [1, 6],
		'DOOR-0': [0, 6],

		'CHEST': [8, 7],
		'CHEST-0': [9, 7],
		'CHEST-1': [10, 7],
		'CHEST-2': [11, 7],

		'HERO': [19, 7],
		'HERO2': [20, 7],
		'HERO3': [21, 7],

		'SPEECH': [19, 9]
	};

	var ChestOpen = [
		'CHEST-0',
		'CHEST-1',
		'CHEST-2'
	];
	var ChestClose = [
		'CHEST-1',
		'CHEST-0',
		'CHEST'
	];
	var DoorOpen = [
		'DOOR-3',
		'DOOR-2',
		'DOOR-1',
		'DOOR-0',
	];
	var DoorClose = [
		'DOOR-1',
		'DOOR-2',
		'DOOR-3',
		'DOOR',
	];

	function parseLevel(level, callback) {
		var row = 0,
			col = 0;

		for(var x = 0, m = level.length; x < m; x++) {
			var found_object = ObjectKey[level[x]];
			if (typeof found_object !== 'undefined') {
				callback(found_object, col, row);
				col += 1;
				if (col >= MapColumns) {
					row += 1;
					col = 0;
				}
			} else {
				console.log('unknown object: *' + level[x] + '*');
			}
		}
	}

	function createSprite(obj, col, row, opacity) {
		var div = document.createElement('div');
		div.className = 'game-tile';
		div.style.backgroundPosition = -(obj[0] * TileWidth) + 'px ' + -(obj[1] * TileHeight) + 'px';
		div.style.top = (row * TileHeight) + 'px';
		div.style.left = (col * TileWidth) + 'px';
		if (typeof opacity != 'undefined') {
			div.style.opacity = opacity;
		}
		return div;
	}

	function createLevelDocumentFragment(level, canvas) {
		var context = canvas.getContext('2d');

		parseLevel(level, function (obj, col, row) {
			if (!obj)
				return;

			context.drawImage(
				SpriteSheet,
				/* sx */ obj[0] * TileWidth,
				/* sy */ obj[1] * TileHeight,
				/* sw */ TileWidth,
				/* sh */ TileHeight,
				/* dx */ col * TileWidth,
				/* dy */ row * TileHeight,
				/* dw */ TileWidth,
				/* dh */ TileHeight
			);
		});
	}

	function startLevelOne() {
		var gameMap = document.getElementById('game-map');
		while(gameMap.firstChild)
			gameMap.removeChild(gameMap.firstChild);

		var doc = document.createDocumentFragment();
		var canvas = document.createElement('canvas');
		canvas.id = 'game-bg';

		gameMap.appendChild(canvas);

		createLevelDocumentFragment(LevelOne, canvas);

		var hero = createSprite(ObjectKey['HERO'], 5, 6);

		hero.className += ' hero-sprite';
		hero.style.opacity = 0;
		doc.appendChild(hero);

		var chest0 = createSprite(ObjectKey['CHEST'], 3, 4);
		chest0.style.opacity = 0;
		doc.appendChild(chest0);

		var chest1 = createSprite(ObjectKey['CHEST'], 4, 4);
		chest1.style.opacity = 0;
		doc.appendChild(chest1);

		var chest2 = createSprite(ObjectKey['CHEST'], 5, 4);
		chest2.style.opacity = 0;
		doc.appendChild(chest2);

		var chest3 = createSprite(ObjectKey['CHEST'], 6, 4);
		chest3.style.opacity = 0;
		doc.appendChild(chest3);

		var chest4 = createSprite(ObjectKey['CHEST'], 7, 4);
		chest4.style.opacity = 0;
		doc.appendChild(chest4);

		var door1 = createSprite(ObjectKey['DOOR'], 14, 5);
		doc.appendChild(door1);

		var door2 = createSprite(ObjectKey['DOOR'], 15, 5);
		door2.style.opacity = 0;
		doc.appendChild(door2);

		var door3 = createSprite(ObjectKey['DOOR'], 16, 5);
		door3.style.opacity = 0;
		doc.appendChild(door3);


		var speech1 = createSprite(ObjectKey['SPEECH'], 14, 5);
		speech1.style.opacity = 0;
		doc.appendChild(speech1);

		var speech2 = createSprite(ObjectKey['SPEECH'], 15, 5);
		speech2.style.opacity = 0;
		doc.appendChild(speech2);

		var speech3 = createSprite(ObjectKey['SPEECH'], 16, 5);
		speech3.style.opacity = 0;
		doc.appendChild(speech3);

		gameMap.appendChild(doc);

		var showSpeech = function(speech, x) {
			return function(passthrough) {
				return animate(speech)
					.then(fadeAndMoveTo(1, x, 4.5, 0.5))
					.then(fadeAndMoveTo(0, x, 4, 0.5))
					.then(moveTo(x, 5, 0))
					.then(function() { return passthrough; });
			};
		};

		var toggleChest = function(chest, time) {
			return function(passthrough) {
				return animate(chest)
					.then(animateSprite(ChestOpen, 0.3))
					.then(delay(time))
					.then(animateSprite(ChestClose, 0.3))
					.then(function() { return passthrough; });
			}
		}

		var toggleDoor = function(doorToToggle) {
			return function(passthrough) {
				return animate(doorToToggle)
					.then(animateSprite(DoorOpen, 0.3))
					.then(delay(0.5))
					.then(animateSprite(DoorClose, 0.3))
					.then(function() { return passthrough; });
			};
		}

		var showItemAfterDelay = function(item, delayTime, time) {
			return animate(item)
				.then(delay(delayTime))
				.then(fadeTo(1, time));
		};

		var handleOrder = function(doorX, chestX, door, chest) {
			return function(passthrough) {
				return animate(hero)
					.then(moveTo(doorX, 6, 0.3))
					.then(toggleDoor(door, doorX, 0.3))
					.then(moveTo(chestX, 6, 1))
					.then(moveTo(chestX, 5, 0.1))
					.then(toggleChest(chest, 0.3))
					.then(delay(3))
					.then(toggleChest(chest, 0.3))
					.then(moveTo(chestX, 6, 0.3))
					.then(moveTo(doorX, 6, 1))
					.then(toggleDoor(door, doorX, 0.3))
			}
		}

		animate(hero)
			.then(waitForIt)

			// Show the hero
			.then(fadeTo(1, 1))
			.then(waitForIt)

			// Show the chests
			.then(function() {
				return deferred(
					showItemAfterDelay(chest1, 0, 0.5),
					showItemAfterDelay(chest2, 0.2, 0.5),
					showItemAfterDelay(chest3, 0.4, 0.5),
					showItemAfterDelay(chest4, 0.6, 0.5)
				);
			})
			.then(waitForIt)

			// Show speech bubble at door.
			.then(showSpeech(speech1, 14))
			.then(waitForIt)

			// Move hero to door
			.then(animate(hero))
			.then(moveTo(14, 6, 1.5))

			// Accept order
			.then(toggleDoor(door1))

			// Move here to chest
			.then(animate(hero))
			.then(moveTo(5, 6, 1.5))
			.then(moveTo(5, 5, 0.3))

			// Open chest
			.then(toggleChest(chest2, 0.5))
			.then(waitForIt)
			.then(toggleChest(chest2, 0.5))

			// Move back to the door
			.then(animate(hero))
			.then(moveTo(5, 6, 0.3))
			.then(moveTo(14, 6, 1.5))

			// Send order
			.then(toggleDoor(door1))

			// Move away from the door
			.then(animate(hero))
			.then(delay(0.3))
			.then(moveTo(14, 7, 0.3))

			// Show the other 2 doors, put in orders
			.then(waitForIt)
			.then(function() {
				return deferred(
					animate(door2).then(fadeTo(1, 1)), 
					animate(door3).then(fadeTo(1, 1)) 
				);
			})
			.then(delay(1))

			// Show 3 orders come in at once
			.then(function() {
				return deferred(
					animate(speech1).then(delay(0.1)).then(showSpeech(speech1, 14)),
					animate(speech2).then(delay(0.3)).then(showSpeech(speech2, 15)),
					animate(speech3).then(delay(0.6)).then(showSpeech(speech3, 16))
				);
			})
			.then(waitForIt)

			.then(handleOrder(14, 5, door1, chest2))
			.then(handleOrder(15, 5, door2, chest2))
			.then(handleOrder(16, 5, door3, chest2))
			.then(moveTo(16, 7, 0.3))

			.then(waitForIt)
			.then(function() {
				return deferred(
					animate(speech1).then(delay(0.1)).then(showSpeech(speech1, 14)),
					animate(speech2).then(delay(0.3)).then(showSpeech(speech2, 15)),
					animate(speech3).then(delay(0.6)).then(showSpeech(speech3, 16))
				);
			})
			.then(waitForIt)

			// Let's do ASYNC!
			.then(animate(hero))

			.then(moveTo(14, 7, 0.3)) // First door
			.then(moveTo(14, 6, 0.3))
			.then(toggleDoor(door1))
			.then(moveTo(4, 6, 1))
			.then(moveTo(4, 5, 0.3))
			.then(toggleChest(chest1))
			.then(moveTo(4, 6, 0.3))
			.then(moveTo(15, 6, 1))
			.then(toggleDoor(door2))
			.then(moveTo(5, 6, 1))
			.then(moveTo(5, 5, 0.3))
			.then(toggleChest(chest2))
			.then(moveTo(5, 6, 0.3))
			.then(moveTo(16, 6, 1))
			.then(toggleDoor(door3))
			.then(moveTo(6, 6, 1))
			.then(moveTo(6, 5, 0.3))
			.then(toggleChest(chest3))
			.then(delay(1))
			.then(moveTo(4, 5, 0.3))
			.then(toggleChest(chest1))
			.then(moveTo(4, 6, 0.3))
			.then(moveTo(14, 6, 1))
			.then(toggleDoor(door1))
			.then(moveTo(5, 6, 1))
			.then(moveTo(5, 5, 0.3))
			.then(toggleChest(chest2))
			.then(moveTo(5, 6, 0.3))
			.then(moveTo(15, 6, 1))
			.then(toggleDoor(door2))
			.then(moveTo(6, 6, 1))
			.then(moveTo(6, 5, 0.3))
			.then(toggleChest(chest3))
			.then(moveTo(6, 6, 0.3))
			.then(moveTo(16, 6, 1))
			.then(toggleDoor(door3))
			.then(moveTo(16, 7, 0.3))
			.then(waitForIt)

			// Order is not guarenteed
			.then(function() {
				return deferred(
					animate(speech1).then(delay(0.1)).then(showSpeech(speech1, 14)),
					animate(speech2).then(delay(0.3)).then(showSpeech(speech2, 15)),
					animate(speech3).then(delay(0.6)).then(showSpeech(speech3, 16))
				);
			})
			.then(animate(hero))
			.then(moveTo(14, 7, 0.3)) // First door
			.then(moveTo(14, 6, 0.3))
			.then(toggleDoor(door1))
			.then(moveTo(4, 6, 1))
			.then(moveTo(4, 5, 0.3))
			.then(toggleChest(chest1))
			.then(moveTo(4, 6, 0.3))
			.then(moveTo(15, 6, 1))
			.then(toggleDoor(door2))
			.then(moveTo(5, 6, 1))
			.then(moveTo(5, 5, 0.3))
			.then(toggleChest(chest2))
			.then(moveTo(4, 5, 0.3))
			.then(toggleChest(chest1))
			.then(moveTo(4, 6, 0.3))
			.then(moveTo(14, 6, 1))
			.then(toggleDoor(door1))
			.then(moveTo(16, 6, 0.3))
			.then(toggleDoor(door3))
			.then(moveTo(6, 6, 1))
			.then(moveTo(6, 5, 0.3))
			.then(toggleChest(chest3))
			.then(moveTo(5, 5, 0.3))
			.then(toggleChest(chest2))
			.then(moveTo(5, 6, 0.3))
			.then(moveTo(15, 6, 1))
			.then(toggleDoor(door2))
			.then(moveTo(6, 6, 1))
			.then(moveTo(6, 5, 0.3))
			.then(toggleChest(chest3))
			.then(moveTo(6, 6, 0.3))
			.then(moveTo(16, 6, 1))
			.then(toggleDoor(door3))
			.then(moveTo(16, 7, 0.3))


			.done();
	}

	function startLevelTwo() {
		var gameMap = document.getElementById('game-map2');
		while(gameMap.firstChild)
			gameMap.removeChild(gameMap.firstChild);

		var doc = document.createDocumentFragment();
		var canvas = document.createElement('canvas');
		canvas.id = 'game-bg2';

		gameMap.appendChild(canvas);

		createLevelDocumentFragment(LevelOne, canvas);

		var chest1, chest2, chest3, chest4;
		doc.appendChild(chest1 = createSprite(ObjectKey['CHEST'], 4, 4));
		doc.appendChild(chest2 = createSprite(ObjectKey['CHEST'], 5, 4));
		doc.appendChild(chest3 = createSprite(ObjectKey['CHEST'], 6, 4));
		doc.appendChild(chest4 = createSprite(ObjectKey['CHEST'], 7, 4));

		var door1, door2, door3;
		doc.appendChild(door1 = createSprite(ObjectKey['DOOR'], 14, 5));
		doc.appendChild(door2 = createSprite(ObjectKey['DOOR'], 15, 5));
		doc.appendChild(door3 = createSprite(ObjectKey['DOOR'], 16, 5));
		doc.appendChild(door4 = createSprite(ObjectKey['DOOR'], 17, 5));

		var hero1, hero2, hero3;
		doc.appendChild(hero1 = createSprite(ObjectKey['HERO'], 5, 6, 0));
		doc.appendChild(hero2 = createSprite(ObjectKey['HERO2'], 6, 7, 0));
		doc.appendChild(hero3 = createSprite(ObjectKey['HERO3'], 4, 7, 0));

		var speech1, speech2, speech3, speech4;
		doc.appendChild(speech1 = createSprite(ObjectKey['SPEECH'], 14, 5, 0));
		doc.appendChild(speech2 = createSprite(ObjectKey['SPEECH'], 15, 5, 0));
		doc.appendChild(speech3 = createSprite(ObjectKey['SPEECH'], 16, 5, 0));
		doc.appendChild(speech4 = createSprite(ObjectKey['SPEECH'], 17, 5, 0));

		gameMap.appendChild(doc);

		var showSpeech = function(speech, x) {
			return function(passthrough) {
				return animate(speech)
					.then(fadeAndMoveTo(1, x, 4.5, 0.5))
					.then(fadeAndMoveTo(0, x, 4, 0.5))
					.then(moveTo(x, 5, 0))
					.then(function() { return passthrough; });
			};
		};

		var toggleDoor = function(doorToToggle) {
			return function(passthrough) {
				return animate(doorToToggle)
					.then(animateSprite(DoorOpen, 0.3))
					.then(delay(0.5))
					.then(animateSprite(DoorClose, 0.3))
					.then(function() { return passthrough; });
			};
		}

		var toggleChest = function(chest, time) {
			return function(passthrough) {
				return animate(chest)
					.then(animateSprite(ChestOpen, 0.3))
					.then(delay(time))
					.then(animateSprite(ChestClose, 0.3))
					.then(function() { return passthrough; });
			}
		}


		animate(hero1)
			.then(waitForIt)
			.then(fadeTo(1, 1))
			.then(waitForIt)

			.then(function() {
				return deferred(
					animate(hero2).then(delay(0.1)).then(fadeTo(1, 1)),
					animate(hero3).then(delay(0.3)).then(fadeTo(1, 1))
				);
			})
			.then(waitForIt)
			.then(function() {
				return deferred(
					animate(speech1).then(delay(0.1)).then(showSpeech(speech1, 14)),
					animate(speech2).then(delay(0.3)).then(showSpeech(speech2, 15)),
					animate(speech3).then(delay(0.6)).then(showSpeech(speech3, 16)),
					animate(speech4).then(delay(1)).then(showSpeech(speech4, 17))
				);
			})
			.then(waitForIt)
			.then(function() {
				var anim1 = animate(hero1)
					.then(moveTo(14, 6, 1))
					.then(toggleDoor(door1))
					.then(moveTo(4, 6, 1))
					.then(moveTo(4, 5, 0.3))
					.then(toggleChest(chest1))
					.then(delay(3))
					.then(toggleChest(chest1))
					.then(moveTo(4, 6, 0.3))
					.then(moveTo(14, 6, 1))
					.then(toggleDoor(door1))
					.then(delay(1))
					.then(moveTo(14, 8, 0.6))
					.then(moveTo(17, 8, 0.6))
					.then(moveTo(17, 6, 0.6))
					.then(toggleDoor(door4))
					.then(moveTo(7, 6, 1))
					.then(moveTo(7, 5, 0.3))
					.then(toggleChest(chest4))
					.then(delay(3))
					.then(toggleChest(chest4))
					.then(moveTo(7, 6, 0.3))
					.then(moveTo(17, 6, 1))
					.then(toggleDoor(door4))
					.then(moveTo(5, 6, 1))
					;

				var anim2 = animate(hero2)
					.then(moveTo(15, 7, 1))
					.then(moveTo(15, 6, 0.6))
					.then(toggleDoor(door2))
					.then(moveTo(15, 7, 0.6))
					.then(moveTo(5, 7, 1))
					.then(moveTo(5, 5, 0.6))
					.then(toggleChest(chest2))
					.then(delay(3))
					.then(toggleChest(chest2))
					.then(moveTo(5, 7, 0.6))
					.then(moveTo(15, 7, 1))
					.then(moveTo(15, 6, 0.3))
					.then(toggleDoor(door2))
					.then(moveTo(15, 7, 0.3))
					.then(moveTo(6, 7, 1));

				var anim3 = animate(hero3)
					.then(moveTo(4, 8, 0.3))
					.then(moveTo(16, 8, 1))
					.then(moveTo(16, 6, 0.6))
					.then(toggleDoor(door3))
					.then(moveTo(16, 8, 0.6))
					.then(moveTo(6, 8, 1))
					.then(moveTo(6, 5, 0.6))
					.then(toggleChest(chest3))
					.then(delay(3))
					.then(toggleChest(chest3))
					.then(moveTo(6, 8, 0.6))
					.then(moveTo(16, 8, 1))
					.then(moveTo(16, 6, 0.6))
					.then(toggleDoor(door3))
					.then(moveTo(16, 8, 0.6))
					.then(moveTo(4, 8, 1))
					.then(moveTo(4, 7, 0.6));

				return deferred(anim1, anim2, anim3);
			})
			.done();
	}


	function startLevelThree() {
		var gameMap = document.getElementById('game-map3');
		while(gameMap.firstChild)
			gameMap.removeChild(gameMap.firstChild);

		var doc = document.createDocumentFragment();
		var canvas = document.createElement('canvas');
		canvas.id = 'game-bg3';

		gameMap.appendChild(canvas);

		createLevelDocumentFragment(LevelThree, canvas);

		var chest1, chest2, chest3, chest4;
		doc.appendChild(chest1 = createSprite(ObjectKey['CHEST'], 4, 4));
		doc.appendChild(chest2 = createSprite(ObjectKey['CHEST'], 5, 4));
		doc.appendChild(chest3 = createSprite(ObjectKey['CHEST'], 6, 4));
		doc.appendChild(chest4 = createSprite(ObjectKey['CHEST'], 7, 4));

		var door1, door2, door3;
		doc.appendChild(door1 = createSprite(ObjectKey['DOOR'], 14, 5));
		doc.appendChild(door2 = createSprite(ObjectKey['DOOR'], 15, 5));
		doc.appendChild(door3 = createSprite(ObjectKey['DOOR'], 16, 5));
		doc.appendChild(door4 = createSprite(ObjectKey['DOOR'], 17, 5));

		var hero1, hero2, hero3;
		doc.appendChild(hero1 = createSprite(ObjectKey['HERO'], 5, 6));
		doc.appendChild(hero2 = createSprite(ObjectKey['HERO2'], 6, 7));
		doc.appendChild(hero3 = createSprite(ObjectKey['HERO3'], 4, 7));

		gameMap.appendChild(doc);

		var toggleDoor = function(doorToToggle) {
			return function(passthrough) {
				return animate(doorToToggle)
					.then(animateSprite(DoorOpen, 0.3))
					.then(delay(0.5))
					.then(animateSprite(DoorClose, 0.3))
					.then(function() { return passthrough; });
			};
		}

		var toggleChest = function(chest, time) {
			return function(passthrough) {
				return animate(chest)
					.then(animateSprite(ChestOpen, 0.3))
					.then(delay(time))
					.then(animateSprite(ChestClose, 0.3))
					.then(function() { return passthrough; });
			}
		}

		waitForIt()
			.then(function() {
				var anim1 = animate(hero1)
					.then(moveTo(5, 8, 0.3))
					.then(moveTo(14, 8, 1))
					.then(moveTo(14, 6, 0.3))
					.then(toggleDoor(door1))
					.then(moveTo(14, 8, 0.3))
					.then(moveTo(12, 8, 0.5))
					;

				var anim2 = animate(hero2)
					.then(delay(1.5))
					.then(moveTo(6, 8, 0.3))
					.then(moveTo(15, 8, 1))
					.then(moveTo(15, 6, 0.3))
					.then(toggleDoor(door2))
					.then(moveTo(15, 8, 0.3))
					.then(moveTo(13, 8, 0.5))
					;

				var anim3 = animate(hero3)
					.then(delay(3))
					.then(moveTo(4, 8, 0.3))
					.then(moveTo(11, 8, 0.5))
					;

				return deferred(anim1, anim2, anim3);
			})
			.then(waitForIt)
			.then(function() {
				var anim3 = animate(hero3)
					.then(moveTo(7, 8, 0.6))
					.then(moveTo(7, 7, 0.3))
					.then(delay(0.3))
					.then(moveTo(7, 8, 0.3))
					.then(moveTo(16, 8, 1))
					.then(moveTo(16, 6, 0.3))
					.then(toggleDoor(door3))
					.then(moveTo(16, 8, 0.3))
					.then(moveTo(13, 8, 0.6))
					;

				var anim1 = animate(hero1)
					.then(delay(0.3))
					.then(moveTo(8, 8, 0.6))
					.then(moveTo(4, 8, 0.3))
					.then(moveTo(4, 5, 0.3))
					.then(toggleChest(chest1))
					.then(delay(1))
					.then(toggleChest(chest1))
					.then(moveTo(4, 8, 0.3))
					.then(delay(0.3))
					.then(moveTo(11, 8, 1))
					;

				var anim2 = animate(hero2)
					.then(delay(0.4))
					.then(moveTo(9, 8, 0.6))
					.then(moveTo(5, 8, 0.3))
					.then(moveTo(5, 5, 0.3))
					.then(toggleChest(chest2))
					.then(delay(1))
					.then(toggleChest(chest2))
					.then(moveTo(5, 8, 0.3))
					.then(moveTo(12, 8, 0.5))
					;

				return deferred(anim3, anim2, anim1);
			})
			.then(waitForIt)
			.then(function() {
				return deferred(
					animate(hero1).then(fadeTo(0, 1)), 
					animate(hero2).then(fadeTo(0, 1)), 
					animate(hero3).then(fadeTo(0, 1))
				);
			})
			.done();
	}

	var SlideFunctions = {
		'the-game': startLevelOne,
		'the-game2': startLevelTwo,
		'the-game3': startLevelThree
	};

	r.addEventListener('slidechanged', function (e) {
		var func  = SlideFunctions[e.currentSlide.id];
		if (func) {
			func.call(e.currentSlide);
		}
	});
})(Reveal, window.animations, window.deferred);
