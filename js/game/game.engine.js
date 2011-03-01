// loads the specification for the specified stage number and set the global
// variables accordingly
function loadStage(stageNumber) {
    currentStage = stageNumber;

    setGlobalVar = function (globalVar, stageSetting) {
        if (stageSetting) {
            this[globalVar] = stageSetting;
        } else {
            this[globalVar] = 0;
        }
    };

    var stage = stages[currentStage];

    // if all the stages are completed, show a dialog instead
    if (stage == undefined) {
        stop();

        $("#score").html(currentScore);
        $("#congrat").dialog({
            height: 190,
            width: 500,
            modal: true,
            buttons: {
                "Restart": function () {
                    // reset global variables
                    currentScore = 0,
                    comboBonus = 0, 
                    currentStage = 1;

                    $(this).dialog("close");
                    start();
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });

        return false;
    }

    timeRemaining = stage.Time;
    bullets = stage.Bullets;

    setGlobalVar("targetCount", stage.Targets);
    setGlobalVar("bulletTargetCount", stage.BulletTargets); 
    setGlobalVar("bombTargetCount", stage.BombTargets);
    setGlobalVar("timeTargetCount", stage.TimeTargets);
    setGlobalVar("lifeTargetCount", stage.LifeTargets);

    return true;
}

// start the current stage
function start() {
    if (loadStage(currentStage)) {
        // clear the targets array
        targets = new Array();

        // put the moving targets onto the scene
        createTargets();

        // clear the canvas and start the game with a frame rate of roughly 60fps!
        clear();
        redrawInterval = setInterval(draw, 1000 / fps);
        timeInterval = setInterval(updateTime, 1000);
    }
}

// stop the game
function stop() {
    clearInterval(redrawInterval);
    clearInterval(timeInterval);
}

function resume() {
    redrawInterval = setInterval(draw, 1000 / fps);
    timeInterval = setInterval(updateTime, 1000);
}

// game over if no bullet or lives left
function isGameOver() {
    return (bullets == 0 || lives == 0);
}

// the game over animation
function gameOver() {
    stop();

    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.font = "bold 80px arial";
    context.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2);
}

// check if the current stage is complete
function isStageComplete() {
    // are there any regular targets left?    
    for (var i = 0; i < targets.length; i++) {
        var target = targets[i];

        if (!BulletTarget.prototype.isPrototypeOf(target) &&
            !BombTarget.prototype.isPrototypeOf(target) &&
            !LifeTarget.prototype.isPrototypeOf(target) &&
            !TimeTarget.prototype.isPrototypeOf(target)) {
            return false;
        }
    }

    return true;
}

// the stage complete animation
function stageComplete() {
    stop();

    context.fillStyle = "rgba(0, 0, 0, 0.7)";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    context.fillStyle = "white";
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.font = "bold 80px arial";
    context.fillText("Stage " + currentStage + " Complete!", WIDTH / 2, HEIGHT / 2);

    // wait the pre-configured amount of time between stages
    setTimeout(function () {
        currentStage++;
        start();
    }, delayBetweenStages);
}

function calcComboBonus(hitTargets) {
    // if nothing's hit, then reset combo bonus to 0!
    if (hitTargets.length == 0) {
        comboBonus = 0;
        return;
    }

    // go through the targets that are hit 
    for (var i = 0; i < hitTargets.length; i++) {
        var target = hitTargets[i];

        // reset combo bonus if hit a bomb!
        if (BombTarget.prototype.isPrototypeOf(target)) {
            comboBonus = 0;
            return;
        } else if (BulletTarget.prototype.isPrototypeOf(target)) {
            comboBonus += target.getBonus();
        } else if (LifeTarget.prototype.isPrototypeOf(target)) {
            comboBonus++;
        } else if (TimeTarget.prototype.isPrototypeOf(target)) {
            comboBonus += target.getBonus();
        } else {
            comboBonus++;
        }
    }
}

// function to delete a regular target with the specified ID
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
    var index = 0;

    // define a private helper function to generate targets to the specified array
    genTargets = function (count, initTarget) {
        for (var i = 0; i < count; i++) {
            targets[index++] = initTarget();
        }
    };

    // generate targets
    genTargets(targetCount, function () { return new Target(0, 0, targetRadius); });
    genTargets(bulletTargetCount, function () { return new BulletTarget(0, 0, bulletTargetRadius, bulletTargetBonus); });
    genTargets(bombTargetCount, function () { return new BombTarget(0, 0, bombTargetRadius); });
    genTargets(lifeTargetCount, function () { return new LifeTarget(0, 0, lifeTargetRadius); });
    genTargets(timeTargetCount, function () { return new TimeTarget(0, 0, timeTargetRadius, timeTargetBonus); });    
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
    timeTargetElement = document.getElementById("time_target");

    // record high score if local storage is supported
    recordHighScore = Modernizr.localstorage;
    if (recordHighScore) {
        highScore = localStorage.getItem("highScore");

        if (!highScore) {
            highScore = 0;
        }
    }

    $("#canvas").mousemove(function (mouseEvent) {
        // get the coordinates of the click inside the canvas
        currentPosition = getPosition(mouseEvent, this);
    }).mousedown(shoot);

    $("#legends").click(function () {
        $("#legends > dd").toggle("blind", {}, "fast");
    });
}

function shoot() {
    // ignore if no more bullets left!
    if (bullets <= 0) {
        return;
    }

    // find out which targets were hit
    var hitTargets = hitTest(currentPosition);

    // hit the targets
    for (var i = 0; i < hitTargets.length; i++) {
        var target = hitTargets[i];
        target.hit();
        deleteTarget(target.getId());
    }

    // update score
    calcComboBonus(hitTargets);
    currentScore += (comboBonus * hitTargets.length);

    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem("highScore", highScore);
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

    // define function to draw the value
    var drawValue = function (value, imgElement) {
        if (!(bullets <= 0)) {
            // draw the first image
            statusContext.drawImage(imgElement, offsetX, offsetY);
            offsetX += imgElement.width;

            if (value == undefined) {
                // draw the infinity sign next to the image with some padding
                statusContext.drawImage(infinityElement, offsetX + 5, offsetY + 5);
            } else if (value > 5) {
                statusContext.textBaseline = "top";
                statusContext.textAlign = "start";
                statusContext.fillStyle = "white";
                statusContext.font = "bold 30px arial";

                // draw a count next to image, e.g. "x10"
                statusContext.fillText("x" + value, offsetX + 5, offsetY);
            } else {
                // otherwise, draw the remaining value
                for (var i = 1; i < value; i++) {
                    statusContext.drawImage(imgElement, offsetX, offsetY);
                    offsetX += imgElement.width;
                }
            }
        }
    }

    drawValue(bullets, bulletElement);
    offsetX = 10, offsetY += bulletElement.height + 5;
    drawValue(lives, lifeElement);

    // draw the score
    statusContext.textBaseline = "top";
    statusContext.textAlign = "start";
    statusContext.fillStyle = "white";
    statusContext.font = "bold 20px arial";

    statusContext.fillText("SCORE: " + currentScore, WIDTH - 300, 10);
    statusContext.fillText("HIGH SCORE: " + highScore, WIDTH - 300, 40);
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

    if (currentPosition != undefined) {
        // draw the scope
        var scopeX = currentPosition.X - scopeWidth / 2,
        scopeY = currentPosition.Y - scopeHeight / 2;
        context.drawImage(scopeElement, scopeX, scopeY);
    }

    if (isStageComplete()) {
        stageComplete();
    } else if (isGameOver()) {
        gameOver();
    } 
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