( function() {

		window.Zergling = Zergling;
		window.ZergRush = ZergRush;

		var doc = document, body = document.body, atan2 = Math.atan2, cos = Math.cos, sin = Math.sin, sqrt = Math.sqrt, PI = Math.PI, random = Math.random, max = Math.max;

		function Zergling(x, y, rush) {

			this.rush = rush;
			// ZergRush instance
			this.speed = 3;
			this.x = x;
			this.y = y;

			this.width = 20;
			this.height = 20;

			this.isKilling = false;
			this.isFinished = false;

			this.dPulsate = 0;
			this.dom = $('<zergling>').css({
				width : this.width,
				height : this.height,
				position : 'absolute',
				display : 'block',
				background : 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAD3UlEQVQ4y41UXWhcRRg9d+7dvXt387OmxK00pImFpLRGKCmIWoKpVhSKjyKIWEp90Cr6UBCrEuqbiFCEYK0FaWgVoS8thZakoqCEgmkWE1JiY6LNJpuf3b27d+/d+zvzjQ/dlBgT64FhYGDOfN853xkF/wFr4PhuxQmeErVoJwGSG3qu7AXju8+cnwBAAOTGO8rGA39wQJMr5lH8tfymv1jc4TpegQuSulA7dT2RVLc1w0/q42UEX79wfeSbP+1aVCf/N2H185N79KXSuSh758lZ2zp7wSx++9kf8zkA8lBLOv1Wa+alfTx1oqnloQakDFjc//Gqv3TsnbGpeQAcANT7ZKdP9uh5czjM3tnzg1U48cyvvw2NmlYRgAOgNuf55vel0q1d2xITGZMfTkCJxbnS2R6yvqhRXhsr2w4AUgHAHfywRctXhzGT65hcXLryXHbyHAAbgFnffQABgOCaWZk7+HAzNZm8X9cY1Bo90s207q/Kq1cBRAwAZN78gBXKXc58ASO2NQLAA1AG4AIQ68QnAP6QU/jCZHzWq3qQUqDJYi9+2dl+GIDBih+/0caWK8eoVIFl+/4tx7kLoFavijYxX15eKdtukr7zQwHiAoKATld/FUADixes51GopoXpwIsoXOaRDSCsV7YVqGaIy0KRQnAJgkTCV/c/YRjbGRWtXqo44F4ISKhpVVW3qOwfmAuD30mVeaJ7LxNHukvR21msUHqUagEoJMRIMfYmk62bzedGvDcz74gYpiVJCCIEJJniqynN49xhNQlFZdAk2C7d6KiP04NIJVOwIiUQkoQrBdlaGLACYcrzCYITNEVBB4v3AIitn9GtoCoIpJTwSKKKqDxB3iorSv6LHQr44T3CtlA7kEnEk/+HUINqcAIqnGNVCbKznFfYmYX8z2WNxqquAEmgKWTtpzra+wHoD2qbKWqnLQRKxDEB5woAn11cMMO7yeCTUsBR8TkUAg6EqeMJlaXqrW+K2/1Pd5Ej9y3yCAuqc+Oi54wCcBgA+cr0zPV8yh/MuxFKoUDKUR6/0b33IwBJAGwzwtiyGFhy/EROcafPc/NTABYAZ00necku/9SXTLWGIXqJgFZX3f9aW6a5oUkfu1mxvLX4zR16tuVtbfvp1Xn7yBSqN4do9f1JHuUAFAHU1mvEAKQG0pmX20L93QwSPRkWQ2NjvETN8WGWiK0wn3aG5aCvYNs8q1TOnnKLl2xJ7rpPJNooOgNgNDCWft1IH9yhxHvbWOyxNGmtKoPtQtzOIche8Cuj42Gwlvfq+k9kMxeVuhkJAEbd7TVzRH1FdTK/nvv7Uf0bZDwR0ocNa/cAAAAASUVORK5CYII=) no-repeat',
				left : x,
				top : y,
				borderRadius : '5px',
				zIndex : 9999
			}).appendTo('body');

		}


		Zergling.DATA_KEY = 'zergTargetData';
		Zergling.MAX_TARGET_AREA = 50000;
		Zergling.VISION = 1000;
		// 1000 pixels in any direction
		Zergling.LIFE = 50;

		Zergling.isSuitableTarget = function isSuitableTarget(candidate) {

			var targetData;

			if (!candidate) {
				return false;
			}

			// Make sure none of its ancestors are currently targets:
			for (var parent = candidate; parent = parent.parentNode; ) {
				if ($.data(parent, Zergling.DATA_KEY) || /antiZerg/i.test(parent.className)) {
					return false;
				}
			}

			targetData = $.data(candidate, Zergling.DATA_KEY);

			candidate = $(candidate);

			return !/zergling/i.test(candidate[0].nodeName) && !/antiZerg/i.test(candidate[0].className) &&
			// Make sure it's either yet-to-be-a-target or still alive:
			(!targetData || targetData.life > 0) &&
			// Make sure it's not too big
			candidate.width() * candidate.height() < Zergling.MAX_TARGET_AREA;

		};

		Zergling.prototype = {

			calcMovement : function() {

				var target = this.target,
				// Move towards random position within the target element:
				xDiff = (target.position.left + random() * target.width) - this.x, yDiff = (target.position.top + random() * target.height) - this.y, angle = atan2(yDiff, xDiff);

				this.dx = this.speed * cos(angle);
				this.dy = this.speed * sin(angle);

			},

			draw : function() {

				if (this.isFinished) {
					return;
				}

				var target = this.target;

				if (this.isKilling) {
					if (target.life > 0) {
						// It's still alive! Pulsate and continue to kill:
						target.life--;
						this.pulsate();
						target.dom.css('opacity', target.life / Zergling.LIFE);
					} else {
						// It's DEAD!
						target.dom.css('visibility', 'hidden');
						this.pulsate(0);
						this.isKilling = false;
						this.target = null;
					}
					return;
				}

				// If we have no target or if current target is dead:
				if (!this.target || this.target.life <= 0) {

					if (this.findTarget()) {
						target = this.target;
						this.calcMovement();
					} else {
						this.isFinished = true;
						this.dom.fadeOut(100, function() {
							$(this).remove();
						});
						return;
					}

				}

				if (this.hasReachedTarget()) {
					this.isKilling = true;
					return;
				}

				this.x += this.dx;
				this.y += this.dy;
				this.dom.css({
					left : this.x,
					top : this.y
				});

			},

			hasReachedTarget : function() {

				var target = this.target, pos = target.position;

				return this.x >= pos.left && this.y >= pos.top && this.x <= pos.left + target.width && this.y <= pos.top + target.height;
			},

			findTarget : function() {

				// Try to locate nearby elements, going further afield (increasing radius)
				// until we've found a viable target:

				var targetData, radius, degree, x, y, el, 
					halfWidth = this.width / 2, 
					halfHeight = this.height / 2, 
					// scrollTop = max(100, 100), 
					// scrollLeft = max(100, 100);
					scrollTop = max($('body').scrollTop(), doc.documentElement.scrollTop),
					scrollLeft = max($('body').scrollLeft(), doc.documentElement.scrollLeft);

				for ( radius = 10; radius < Zergling.VISION; radius += 50) {
					for ( degree = 0; degree < 360; degree += 45) {

						x = this.x + halfWidth + radius * cos(PI / 180 * degree) - scrollLeft;
						y = this.y + halfHeight + radius * sin(PI / 180 * degree) - scrollTop;

						if (Zergling.isSuitableTarget( el = doc.elementFromPoint(x, y))) {

							el = $(el);

							targetData = this.target = el.data(Zergling.DATA_KEY);

							if (!targetData) {
								el.data(Zergling.DATA_KEY, this.target = {
									dom : el,
									position : el.offset(),
									width : el.width(),
									height : el.height(),
									life : Zergling.LIFE,
									initialCSS : {
										visibility : '',
										opacity : el.css('opacity') || ''
									}
								});
								this.rush.registerTarget(this.target);
							}

							return true;

						}
					}
				}

			},

			pulsate : function() {
				if (this.dPulsate = !this.dPulsate) {
					this.dom.css({
						left : this.x - 2,
						top : this.y - 2,
						width : 20,
						height : 20
					});
				} else {
					this.dom.css({
						left : this.x,
						top : this.y,
						width : 20,
						height : 20
					});
				}
			}
		};

		function ZergRush(nZerglings) {

			var me = this, zerglings = this.zerglings = [], targets = this.targets = [];

			for (var i = 0; i < nZerglings; ++i) {
				zerglings.push(new Zergling(random() * 100, random() * 100, this));
			}

			this.intervalID = setInterval(function() {
				me.step();
			}, 30);

		}


		ZergRush.prototype = {
			step : function() {

				var areFinished = true;

				for (var i = 0; i < this.zerglings.length; ++i) {
					this.zerglings[i].draw();
					areFinished = areFinished && this.zerglings[i].isFinished;
				}

				if (areFinished) {
					clearInterval(this.intervalID);
				}

			},
			destroy : function() {
				clearInterval(this.intervalID);
				for (var i = 0; i < this.zerglings.length; ++i) {
					this.zerglings[i].dom.remove();
				}
				for (var i = 0; i < this.targets.length; ++i) {
					this.targets[i].dom.css(this.targets[i].initialCSS);
					this.targets[i].dom.removeData(Zergling.DATA_KEY);
				}
			},
			registerTarget : function(target) {
				this.targets.push(target);
			}
		};

	}()); 