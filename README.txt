Canvas Blank

Yan Cui
theburningmonk@gmail.com

2011-03-01

INTRO:

This is a mini-game I made using HTML5's canavs element and uses local storage to remember a player's hi-score.

LIVE DEMO:

You can try the live demo at http://canvasblank.theburningmonk.com or http://LNK.by/fg4y.
I've also put together a two-part tutorial (so far) which covers most of the steps I took to made the game:
* part 1 - http://theburningmonk.com/2011/01/having-fun-with-html5-canvas-part-4
* part 2 - http://theburningmonk.com/2011/01/having-fun-with-html5-canvas-part-5

THIRD-PARTY LIBRARIES:
* jQuery (in js/jquery)
* Modernizr (in js/modernizr)
* MooTools (in js/mootools)

JAVASCRIPTS:
* js/game/game.classes.js: This file uses MooTools' Class facility to specify a number of different types of 
targets that can appear in the game, some needs to be shot in order to clear the current stage, others gives the
player a small bonus (in time or bullets) and some makes the player's life a little more difficult by deducting
the player's HP when they're hit.

* js/game/game.globalvars.js: This file defines all the global variables used by the 'classes' and 'engine' scripts

* js/game/game.engine.js: This file is the engine which drives the game, updating the game state and drawing onto
the canvas, etc. etc. Right now, the game and drawing are done in the same loop and I haven't done any optimization
on the game itself, but the game works as it is (see demo).

CSS:
* sunny: Files inside this folder is used by jQuery UI

* main.css: This file contains all the CSS settings for the game

HTML:
* canvas_blank.html: This file contains all the HTML markup for the game, including the initial loading screen