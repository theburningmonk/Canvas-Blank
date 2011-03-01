// define the Target 'class' to represent an on-screen target
var Target = new Class({
    initialize: function (x, y, radius, dx, dy) {
        var _id = targetId++,
            _x = x, _y = y, _radius = radius, _dx = dx, _dy = dy;

        // set _dx and _dy if not specified in input parameter
        if (!_dx) {
            _dx = Math.random() * maxTargetSpeed;
        }
        if (!_dy) {
            _dy = Math.random() * maxTargetSpeed;
        }

        // getters
        this.getId = function () {
            return _id;
        }

        this.getX = function () {
            return _x;
        };

        this.getY = function () {
            return _y;
        };

        this.getRadius = function () {
            return _radius;
        };

        this.getDx = function () {
            return _dx;
        };

        this.getDy = function () {
            return _dy;
        };

        // move the target to its position for the next frame
        this.move = function () {
            _x += _dx;
            _y += _dy;

            // change direction in X if it 'hits' the border
            if ((_x + _radius * 2) >= WIDTH || _x <= 0) {
                _dx *= -1;
            }

            // change direction in Y if it 'hits' the border
            if ((_y + _radius * 2) >= HEIGHT || _y <= 0) {
                _dy *= -1;
            }
        };

        // draws the target on the canvas
        this.draw = function () {
            context.drawImage(targetElement, _x, _y, _radius * 2, _radius * 2);
        };

        // hit the target!
        this.hit = function () {
        };
    }
});

// a target which awards the player with an extra bullet when hit
var BulletTarget = new Class({
    Extends: Target,
    initialize: function (x, y, radius, bonus, dx, dy) {
        // initialize Target's properties
        this.parent(x, y, radius, dx, dy);

        this.getBonus = function () {
            return bonus;
        };

        // override the draw function to draw the bullet target instead
        this.draw = function () {
            context.drawImage(bulletTargetElement, this.getX(), this.getY(), radius * 2, radius * 2);
        };

        // override the hit function to give the player some bullets back 
        this.hit = function () {
            if (bullets != undefined) {
                bullets += bonus;
            }
        }
    }
});

// a target which decreases a player's lives when hit
var BombTarget = new Class({
    Extends: Target,
    initialize: function (x, y, radius, dx, dy) {
        // initialize Target's properties
        this.parent(x, y, radius, dx, dy);

        // override the draw function to draw the bomb target instead
        this.draw = function () {
            context.drawImage(bombTargetElement, this.getX(), this.getY(), radius * 2, radius * 2);
        }

        // override the hit function to deduct the player's lives
        this.hit = function () {
            if (lives != undefined) {
                lives--;
            }
        }
    }
});

// a target which increases a player's lives when hit
var LifeTarget = new Class({
    Extends: Target,
    initialize: function (x, y, radius, dx, dy) {
        // initialize Target's properties
        this.parent(x, y, radius, dx, dy);

        // override the draw function to draw the bomb target instead
        this.draw = function () {
            context.drawImage(lifeTargetElement, this.getX(), this.getY(), radius * 2, radius * 2);
        }

        // override the hit function to deduct the player's lives
        this.hit = function () {
            if (lives != undefined) {
                lives++;
            }
        }
    }
});

// a target which add time to the player's clock
var TimeTarget = new Class({
    Extends: Target,
    initialize: function (x, y, radius, bonus, dx, dy) {
        // initialize Target's properties
        this.parent(x, y, radius, dx, dy);

        this.getBonus = function () {
            return bonus;
        }

        // override the draw function to draw the time target instead
        this.draw = function () {
            context.drawImage(timeTargetElement, this.getX(), this.getY(), radius * 2, radius * 2);
        }

        // override the hit function to increase the player's time left on the clock
        this.hit = function () {
            if (timeRemaining != undefined) {
                timeRemaining += bonus;
            }
        }
    }
});

var FloatingTarget = new Class({
    Extends: Target,
    initialize: function (x, y, radius, dx, dy) {
        // initialize Target's properties
        this.parent(x, y, radius, dx, dy);

        // override the move function to change the way the target moves
        this.move = function () {
            _x += _dx;
            _y += _dy;

            // change direction in X if it 'hits' the border
            if ((_x + _radius * 2) >= WIDTH || _x <= 0) {
                _dx *= -1;
            }

            // change direction in Y if it 'hits' the border
            if ((_y + _radius * 2) >= HEIGHT || _y <= 0) {
                _dy *= -1;
            }
        };
    }
});

// define the Message 'class' to represent an on-screen message
var Message = new Class({
    initialize: function (x, y, message, duration) {
        var _id = messageId++,
            _x = x, _y = y, _message = message, _duration = duration;

        this.getId = function () {
            return _id;
        }

        this.draw = function () {
            if (_duration >= 0) {
                context.textBaseline = "middle";
                context.textAlign = "center";
                context.fillStyle = "white";
                context.font = "bold 40px arial";

                // draw the message at the specified X, Y coordinates
                context.fillText(_message, _x, _y);

                _duration--;
            } else {
                // remove the message
                for (var i = 0; i < messages.length; i++) {
                    var message = messages[i];

                    if (message.getId() == _id) {
                        messages.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }
});