// function to delete the target with the specified ID
function deleteTarget(id) {
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];

        if (target.getId() == id) {
            targets.splice(i, 1);
            break;
        }
    }
}

// Add targets to the game
function createTargets() {
    for (var i = 0; i < 10; i++) {        
        if (Math.random() < bulletTargetChance) {
            targets[i] = new BulletTarget(0, 0, bulletTargetRadius, bulletTargetBonus);
        } else if (Math.random() < bombTargetChance) {
            targets[i] = new BombTarget(0, 0, bombTargetRadius);
        } else if (Math.random() < lifeTargetChance) {
            targets[i] = new LifeTarget(0, 0, lifeTargetRadius);
        } else {
            targets[i] = new Target(0, 0, targetRadius);
        }
    }
}

// Draw the target canvas element, and initialise the global 
// variables so that they can be used here after
function initialize() {    
    canvasElement = document.getElementById("canvas");
    context = canvasElement.getContext("2d");
    statusElement = document.getElementById("status");
    statusContext = statusElement.getContext("2d");
    scopeElement = document.getElementById("scope");
    scopeWidth = scopeElement.width;
    scopeHeight = scopeElement.height;

    WIDTH = canvasElement.width;
    HEIGHT = canvasElement.height;

    // get references to the image elements
    targetElement = document.getElementById("target");
    bulletTargetElement = document.getElementById("bullet_target");
    bulletElement = document.getElementById("bullet");
    infinityElement = document.getElementById("infinity");
    lifeElement = document.getElementById("life");
    bombTargetElement = document.getElementById("bomb_target");
    lifeTargetElement = document.getElementById("life_target");

    $("#canvas").mousemove(function (mouseEvent) {
        // get the coordinates of the click inside the canvas
        currentPosition = getPosition(mouseEvent, this);        
    }).mousedown(function (mouseEvent) {
        // ignore if no more bullets left!
        if (bullets <= 0) {
            return;
        }

        // find out which targets were hit
        var hitTargets = hitTest(currentPosition);

        // hit the targets
        for (var i = 0; i < hitTargets.length; i++) {
            hitTargets[i].hit();
        }

        // use one of the defined messages if possible, otherwise use a default
        var hitMessage = hitMessages[hitTargets.length];
        if (hitMessage == undefined) {
            hitMessage = "TOO GOOOOOOOOD..";
        }

        messages.push(new Message(currentPosition.X, currentPosition.Y, hitMessage, 30));

        // deduct the number of shots left if a cap is defined
        if (bullets != undefined) {
            bullets--;
        }
    });

    // put the moving targets onto the scene
    createTargets();

    // clear the canvas and start the game with a frame rate of roughly 60fps!
    clear();
    redrawInterval = setInterval(draw, 1000 / fps);

    // update the time left every second
    timeInterval = setInterval(updateTime, 1000);
}

// update the time remaining value and if the time has run out then stop the game
function updateTime() {
    if (timeRemaining <= 0) {
        // take away all your bullets
        bullets = 0;
        
        // stop the timer interval checks
        clearInterval(timeInterval);
    } else {
        // one less second left.. tic toc
        timeRemaining--;
    }
}

// clear the canvas page
function clear() {
    // reset the canvas by resizing the canvas element
    canvasElement.width = canvasElement.width;
    statusElement.width = statusElement.width;
}

// draw the bullets and lives onto the top left hand corner
function drawGameStatus() {
    // define basica X and Y offsets
    var offsetX = 10, offsetY = 10;

    statusContext.textBaseline = "middle";
    statusContext.textAlign = "center";
    statusContext.font = "bold 80px arial";

    // use a different colour depending on time left
    if (timeRemaining > 10) {
        statusContext.fillStyle = "white";
    } else if (timeRemaining <= 10 && timeRemaining > 5) {
        statusContext.fillStyle = "gold";
    } else {
        statusContext.fillStyle = "red";
    }

    // show the time
    statusContext.fillText(timeRemaining, WIDTH / 2, 50);

    // draw the bullets
    if (!(bullets <= 0)) {
        // draw the first bullet
        statusContext.drawImage(bulletElement, offsetX, offsetY);
        offsetX += bulletElement.width;

        if (bullets == undefined) {
            // draw the infinity sign next to the bullet with some padding
            statusContext.drawImage(infinityElement, offsetX + 5, offsetY + 5);
        } else if (bullets > 5) {
            statusContext.textBaseline = "top";
            statusContext.textAlign = "start";
            statusContext.fillStyle = "white";
            statusContext.font = "bold 40px arial";

            // draw a count next to the bullet, e.g. "x10"
            statusContext.fillText("x" + bullets, offsetX + 5, offsetY);
        }
        else {
            // otherwise, draw the remaining bullets
            for (var i = 1; i < bullets; i++) {
                statusContext.drawImage(bulletElement, offsetX, offsetY);
                offsetX += bulletElement.width;
            }
        }
    }

    if (!(lives <= 0)) {
        // draw the lives underneath the bullets
        offsetY += bulletElement.height + 5;
        offsetX = 10;

        // draw the first life
        statusContext.drawImage(lifeElement, offsetX, offsetY);
        offsetX += lifeElement.width;

        if (lives == undefined) {
            // draw the infinity sign next to the bullet with some padding
            statusContext.drawImage(infinityElement, offsetX + 5, offsetY + 5);
        } else if (lives > 5) {
            statusContext.textBaseline = "top";
            statusContext.textAlign = "start";
            statusContext.fillStyle = "white";
            statusContext.font = "bold 40px arial";

            // draw a count next to the life, e.g. "x10"
            statusContext.fillText("x" + lives, offsetX + 5, offsetY);
        }
        else {
            // otherwise, draw the remaining lives
            for (var i = 1; i < lives; i++) {
                statusContext.drawImage(lifeElement, offsetX, offsetY);
                offsetX += lifeElement.width;
            }
        }
    }
}

// redraw the target boards on the canvas
function draw() {
    // clear the canvas page first
    clear();
    
    // first draw the moving targets
    for (var i = 0; i < targets.length; i++) {
        targets[i].move();
        targets[i].draw();
    }

    // then the messages on top of them
    for (var i = 0; i < messages.length; i++) {
        messages[i].draw();
    }

    // then the game status related information
    drawGameStatus();

    // draw the scope
    var scopeX = currentPosition.X - scopeWidth / 2,
        scopeY = currentPosition.Y - scopeHeight / 2;    
    context.drawImage(scopeElement, scopeX, scopeY);
}

// works out the X, Y position of the click INSIDE the canvas from the X, Y 
// position on the page
function getPosition(mouseEvent, element) {
    var x, y;
    if (mouseEvent.pageX != undefined && mouseEvent.pageY != undefined) {
        x = mouseEvent.pageX;
        y = mouseEvent.pageY;
    } else {
        x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return { X: x - element.offsetLeft, Y: y - element.offsetTop };
}

// check if the player managed to hit any of the live targets
function hitTest(position) {
    var hitTargets = new Array();

    // check if the position is within the bounds of any of the live targets
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];

        var targetCentreX = target.getX() + target.getRadius(),
            targetCentreY = target.getY() + target.getRadius();

        // work out the distance between the position and the target's centre
        var xdiff = position.X - targetCentreX,
            ydiff = position.Y - targetCentreY,
            dist = Math.sqrt(Math.pow(xdiff, 2) + Math.pow(ydiff, 2));

        // if that distance is less than the radius of the target then the
        // position is inside the target
        if (dist <= target.getRadius()) {
            hitTargets.push(target);
        }
    }

    return hitTargets;
}