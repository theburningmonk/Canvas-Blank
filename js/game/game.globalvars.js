/* GLOBAL VARIABLES */
var WIDTH,                      // width of the canvas area
    HEIGHT,                     // height of the canvas area

    canvasElement,              // the main canvas element
    context,                    // the 2D drawing context for the canvas
    statusElement,              // the game status canvas element
    statusContext,              // the 2D drawing context for the status canvas

    scopeElement,               // the scope img element
    scopeWidth,                 // the width of the scope
    scopeHeight,                // the height of the scope

    targetElement,              // the target img element
    targetRadius = 50,          // the radius of the regular targets
    targetCount = 10,           // the number of targets

    bulletTargetElement,        // the bullet target img element
    bulletTargetRadius = 30,    // the radius of the bullet targets
    bulletTargetBonus = 3,      // the number of extra bullets for hitting a bullet target
    bulletTargetCount = 1,      // the number of bullet targets

    bombTargetElement,          // the bomb target img element
    bombTargetRadius = 50,      // the radius of the bomb targets
    bombTargetCount = 1,        // the number of bomb targets

    lifeTargetElement,          // the life target img element
    lifeTargetRadius = 30,      // the radius of the life targets
    lifeTargetCount = 1,        // the number of life targets

    timeTargetElement,          // the time target img element
    timeTargetRadius = 30,      // the radius of the time targets
    timeTargetBonus = 5,        // the amount of seconds a time target restores
    timeTargetCount = 1,        // the number of time targets

    targets = new Array(),      // the main targets that need to be shot down
    targetId = 0,               // the current target ID

    messages = new Array(),     // on-screen messages
    messageId = 0,              // the current message ID

    bulletElement,              // the bullet img element
    infinityElement,            // the infinity img element
    lifeElement,                // the life img element

    redrawInterval,             // interval ID of the redraw interval
    timeInterval,               // interval ID of the time checks
    
    maxTargetSpeed = 10,        // the maximum speed of the targets
    bullets = 10,               // how many shots left
    lives = 5,                  // how many lives the player has left
    timeRemaining = 15,         // how many seconds left to finish off all the targets
    recordHighScore = false,    // whether or not to store high score for the player
    highScore = 0,              // the player's highest score ever
    currentScore = 0,           // the player's current score
    comboBonus = 0,             // the cumulative bonus for hitting targets consecutively

    fps = 75,                   // how frequently do we update?
    currentPosition             // the cursor's current position inside the canvas
    currentStage = 1,           // the current stage
    delayBetweenStages = 3000;  // how many milliseconds do we wait between stages

// define the messages to show
var hitMessages = {
    0   :   "MISS",
    1   :   "HIT!",
    2   :   "DOUBLE!!",
    3   :   "HAT-TRICK!!!",
    4   :   "UN~BELIEVABLE!!!!",
    5   :   "OH MY GOSH!!"
};

// define the stages the player can play through
var stages = {
    1   :   { Time: 30, Targets: 3, Bullets: 15 },
    2   :   { Time: 30, Targets: 5, Bullets: 15 },
    3   :   { Time: 30, Targets: 8, Bullets: 18 },
    4   :   { Time: 30, Targets: 10, Bullets: 20 },
    5   :   { Time: 30, Targets: 10, Bullets: 18 },    
    6   :   { Time: 30, Targets: 10, Bullets: 15, BulletTargets: 1 },
    7   :   { Time: 30, Targets: 10, Bullets: 13, BulletTargets: 2 },
    8   :   { Time: 30, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 1 },
    9   :   { Time: 30, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 2 },
    10  :   { Time: 25, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 2, LifeTargets: 1 },
    11  :   { Time: 25, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 3, LifeTargets: 2 },
    12  :   { Time: 20, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 2, TimeTargets: 1 },
    13  :   { Time: 30, Targets: 30, BombTargets: 5, TimeTargets: 5, LifeTargets: 5 },
    14  :   { Time: 25, Targets: 30, BombTargets: 5, TimeTargets: 5, LifeTargets: 3 },
    15  :   { Time: 25, Targets: 35, BombTargets: 5, TimeTargets: 5, LifeTargets: 3 },
    16  :   { Time: 25, Targets: 35, BombTargets: 8, TimeTargets: 3, LifeTargets: 3 },
    17  :   { Time: 25, Targets: 40, BombTargets: 10, TimeTargets: 5, LifeTargets: 5 },
    18  :   { Time: 25, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 3, TimeTargets: 1, LifeTargets: 1 },
    19  :   { Time: 20, Targets: 10, Bullets: 15, BulletTargets: 1, BombTargets: 3, TimeTargets: 2, LifeTargets: 1 },
    20  :   { Time: 20, Targets: 12, Bullets: 15, BulletTargets: 2, BombTargets: 3, TimeTargets: 2, LifeTargets: 1 },
    21  :   { Time: 20, Targets: 14, Bullets: 15, BulletTargets: 2, BombTargets: 3, TimeTargets: 2, LifeTargets: 1 },
    22  :   { Time: 20, Targets: 15, Bullets: 15, BulletTargets: 3, BombTargets: 5, TimeTargets: 3, LifeTargets: 2 }
};