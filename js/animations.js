(function(deferred) {
	var _buttonHit = false;

	var $curry = function(fn) {
		var args = Array.prototype.slice.call(arguments, 1);
		return function() {
			return fn.apply(this, args.concat(Array.prototype.slice.call(arguments)));
		}
	};

	var $map = function(arr, cb) {
		var results = [];
		for(var x = 0, m = arr.length; x < m; x++) {
			results[x] = cb.apply(arr[x]);
		}
		return results;
	}

	var delay = function (timeout, passthrough) {
		var def = deferred();

		setTimeout(function() {
			def.resolve(passthrough);
		}, timeout * 1000);

		return def.promise;
	};

	var moveTo = function(x, y, timeout, obj) {
		/*
		obj.style.transition = 'left ' + timeout + 's, top ' + timeout + 's';
		obj.style.left = x + 'px';
		obj.style.top = y + 'px';
		return delay(timeout, obj);
		*/

		return animateTo({position: [x, y]}, timeout, obj);
	};

	var fadeTo = function(alpha, timeout, obj) {
		/*
		var def = deferred();

		obj.style.transition = 'opacity ' + timeout + 's';
		setTimeout(function() {
			obj.style.opacity = 1;
			def.resolve(delay(timeout, obj));
		}, 10);

		return def.promise;
		*/
		return animateTo({opacity: alpha}, timeout, obj);
	};

	var fadeAndMoveTo = function(alpha, x, y, timeout, obj) {
		return animateTo({
			opacity: alpha,
			position: [x, y]
		}, timeout, obj);
	};

	var animateTo = function(props, timeout, obj) {
		var def = deferred();

		var transition = [];
		for (key in props) { if (props.hasOwnProperty(key)) {
			switch (key) {
				case 'opacity':
					transition.push('opacity ' + timeout + 's');
					break;
				case 'position':
					transition.push('left ' + timeout + 's');
					transition.push('top ' + timeout + 's');
					break;
			}
		} }

		obj.style.transition = transition.join(', ');
		setTimeout(function() {
			for (key in props) { if (props.hasOwnProperty(key)) {
				switch (key) {
					case 'opacity':
						obj.style.opacity = props[key];
						break;
					case 'position':
						obj.style.left = props[key][0] + 'px';
						obj.style.top = props[key][1] + 'px';
						break;
				}
			} }

			if (timeout)
				def.resolve(delay(timeout, obj));
			else
				def.resolve(obj);
		});

		return def.promise;
	}

	var animate = function(obj) {
		return deferred(obj);
	};

	var waitForIt = function(obj) {
		var def = deferred();

		_buttonHit = false;
		var interval = setInterval(function() {
			if (_buttonHit) {
				clearInterval(interval);

				_buttonHit  = false;
				def.resolve(obj);
			}
		}, 100);

		return def.promise;
	};

	var changeBg = function(pos, time, obj) {
		obj.style.backgroundPosition = pos[0] + 'px ' + pos[1] + 'px';
		return delay(time, obj);
	};

	var animateSprite = function(steps, time, obj) {
		var promise = animate(obj);
		var timePerFrame = time / steps.length;

		for (var x=0, m=steps.length; x < m; x++) {
			var step = steps[x];
			promise = promise.then(function() { 
				return changeBg(step, timePerFrame, obj);
			});
		}

		return promise;
	};

	/*
	var animateSpriteDuring = function(steps, fps, until, obj) {
		console.log(arguments);

		var timePerFrame = 1 / fps,
			isDone = false,
			def = deferred();

		console.log(timePerFrame);

		var animateFrame = function(step) {
			console.log('animateFrame');
			console.log(step);

			if (isDone)
				return deferred(obj);
			
			console.log('ANM FRAME');
			console.log(step);

			return changeBg(step, timePerFrame, obj);
		}

		var buildAnimation = function() {
			var promise = animate(obj);

			// Build a sequence of promises
			for (var x=0, m=steps.length; x < m; x++) {
				var step = steps[x];
				promise = promise.then(function() { return animateFrame(step); });
			}

			// Make it recursive
			promise.then(function() {
				if (isDone)
					return deferred(obj);

				console.log('recurse');
				return buildAnimation();
			});

			return promise;
		}

		// Execute the other animation until it is done.
		until(obj).then(function (passthrough) {
			console.log('Done');
			isDone = true;
		});

		return buildAnimation();
	};
	*/

	// Usage: repeatThis(animateGuy).until(waitForIt);
	function repeatThis(promise) {
		return {
			until: function (endPromise) {
				var def = deferred(),
					_continue = true;

				function executePromise() {
					return promise.then(function (result) {
						if (!_continue) {
							def.resolve(result);
						} else {
							executePromise();
						}
					}, function (err) {
						def.reject(err);
					});
				}

				endPromise.then(function(result) {
					_continue = false;
				});

				return def.promise;
			}
		};
	}

	var manyTimes = function(count, todo, obj) {
		var promise = deferred(obj);

		for(var x = 0; x < count; x++) {
			promise = promise.then(todo);
		}

		return promise;
	};

	window.animations = {
		delay: function(timeout) { return $curry(delay, timeout); },
		moveTo: function(x, y, timeout) { return $curry(moveTo, x, y, timeout); },
		fadeTo: function(alpha, timeout) { return $curry(fadeTo, alpha, timeout); },
		fadeAndMoveTo: function(alpha, x, y, timeout) { return $curry(fadeAndMoveTo, alpha, x, y, timeout); },
		// animateSpriteDuring: function(steps, fps, until) { return $curry(animateSpriteDuring, steps, fps, until) },
		animateSprite: function(steps, time) { return $curry(animateSprite, steps, time); },
		manyTimes: function(count, todo) { return $curry(manyTimes, count, todo); },
		waitForIt: waitForIt,
		animate: animate
	};

	window.addEventListener('keyup', function (evt) {
		// console.log(evt.keyCode);
		if (evt.keyCode == 13) {
			_buttonHit = true;
		}
	});
})(window.deferred);