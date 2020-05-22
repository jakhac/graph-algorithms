/**
 * Graph algorithm result animation functionality for graph algorithm
 * visualizer tool.
 *
 * Authors: Kevin Katzkowski
 * Updated: 30.03.2020
 */

import * as Canvas from './canvas.js';
import { Edge } from './edge.js';
import * as App from '/app.js';
import * as Tutorial from './tutorial.js';

// copy of animate path
var animation;

// store drawing mode
var drawingMode = 'singleDraw';

// factor to reduce or increase the animation speed
var speedFactor = 1.0;

// store path for full draw
var fullDrawPath = []

// timeout control
var skipTimeout = false;

// pause control variable
var paused = false;

// auto scrolling during animation
var autoScrollingAllowed = true;

// result path
var path;

// store timeout id for next iteration timeout
var timeout;

// stores the cost of the shortest path
var cost;

// prevents false calculations due to smooth scrolling
var nextScrollX = window.scrollX, nextScrollY = window.scrollY;

// counts the steps of the algorithm
var stepCounter = 0;

const status = document.getElementById('running-state'),
  steps = document.getElementById('running-steps'),
  costs = document.getElementById('running-costs');

/**
 * Starts the animation of the algorithm's execution.
 * 
 * @param {animation path object} resultPath object containing animation path, result path and cost
 */
function start(resultPath) {
  let startButton = document.getElementById('start');
  startButton.innerHTML = 'abort';
  startButton.classList.add('inverted');
  startButton.classList.remove('primary');

  // store result path object locally
  path = resultPath;

  // create animation path copy
  animation = path.animPath.slice();

  // set initial drawing mode 
  drawingMode = 'singleDraw';

  // reset full draw path
  fullDrawPath = []

  // set initial timeout control state
  skipTimeout = false;

  // end pause state
  paused = false;

  // set cost
  cost = resultPath.cost;

  // set animation status
  status.className = 'running';

  resetStepCounter();

  // start iteration through path
  setTimeout(iterate, 500 * speedFactor);
}

/**
 * Highlights the algorithms result: either the shortest path, or the cycle or
 * deadlock path.
 * 
 * @param {animation path object} resultPath object containing animation path, result path and cost
 */
function result(resultPath) {
  // reset animation state
  reset();

  // store animation path object locally
  path = resultPath;

  // create animation path copy
  animation = path.animPath.slice();

  // get steps for step counter
  let s = getResultSteps(animation);

  // set initial drawing mode 
  drawingMode = 'singleDraw';

  // reset full draw path
  fullDrawPath = [];

  // set initial timeout control state
  skipTimeout = false;

  // end pause state
  paused = false;

  // set cost
  cost = resultPath.cost;

  // set animation status
  status.className = 'running';

  // set animation path to one element so iterate is called once
  animation = ['singleDraw'];
  iterate();

  // update the step counter display 
  steps.innerHTML = s;
}

/**
 * Iterate through the animation path object. This function has to be called
 * from either the start() or the result() function. 
 * 
 * During each function call, the animation mode is changed or an element 
 * overlay is drawn.
 */
function iterate() {
  if (paused) {
    return;
  }
  if (animation.length == 0) {
    animation = ['singleDraw'];
  }
  const element = animation.shift();

  // change drawing mode
  if (element == 'fullDraw') {
    // redraw canvas
    Canvas.update();

    // set drawing mode
    drawingMode = 'fullDraw';
    skipTimeout = true;
  } else if (element == 'singleDraw') {
    // set drawing mode
    drawingMode = 'singleDraw';

    // full draw path 
    fullDrawPath.forEach(element => {
      if (element != undefined) element.drawOverlay(Canvas.ctx);
    });

    // delete drawn fullDrawPath
    fullDrawPath = []

    // do not skip timeout for correct animation
    skipTimeout = false;
  } else {
    // if current element is a node or edge
    if (drawingMode == 'singleDraw') {
      // draw current element from path
      element.drawOverlay(Canvas.ctx);
      skipTimeout = false;

      if (element instanceof Edge) {
        stepCounter++;
        steps.innerHTML = stepCounter;
        scrollToElement(element.endNode);
      } else {
        scrollToElement(element);
      }

    } else if (drawingMode == 'fullDraw') {
      // push current element to fullDrawPath
      fullDrawPath.push(element);
      skipTimeout = true;
    }
  }

  // decide if iteration should be continued
  if (animation.length == 0) {
    // remove overlays
    Canvas.update();

    // set color
    let color = 'green';

    let element = path.result[0];

    // draw result  
    if (element == 'cycle' || element == 'deadlock') {
      color = 'red';
      path.result.shift();

      // set animation status
      if (element == 'cycle') {
        status.className = 'cycle';
      } else {
        status.className = 'deadlock';
      }


    } else if (cost == undefined) {
      color = 'red';
    }

    path.result.forEach(elem => {
      if (elem != 'noPathToFinish') {
        if (elem != undefined) {
          elem.drawOverlay(Canvas.ctx, color);
        }
      } else {
        // set animation status
        status.className = 'no-result';
        return;
      }
    });

    if (cost) {
      // set animation status
      status.className = 'terminated';

      // set algorithm costs
      costs.innerHTML = cost;
    } else {
      // set animation status
      status.className = 'no-result';
    }
    console.log('animation completed');

    // end animation state
    end();

    // during tutorial, go to next step
    if (Tutorial.tutorialActive) {
      Tutorial.continueTutorial();
    }
    return;
  } else if (skipTimeout) {
    // skip timeout and call iterate again
    iterate();
  } else {
    // call iterate again after timeout
    timeout = setTimeout(iterate, 500 * speedFactor);
  }
}

/**
 * Aborts the currently running animation.
 */
function abort() {
  end();
  // set animation status
  status.className = 'aborted';
}

/**
 * Ends the animation state and resets sidebar UI elements.
 */
function end() {
  clearTimeout(timeout);
  paused = true;
  let startButton = document.getElementById('start');
  startButton.innerHTML = 'run algorithm';
  startButton.classList.remove('inverted');
  startButton.classList.add('primary');
  App.setAnimating(false);
  scrollToOrigin();
}

/**
 * Ends the animation state and resets all UI elements including result display.
 */
function reset() {
  end();

  status.className = 'inactive';
  costs.innerHTML = '-';
  resetStepCounter();
}

/**
 * Sets the animation speed factor. A smaller factor results in increased speed.
 * 
 * @param {float} factor 
 */
function setSpeedFactor(factor) {
  speedFactor = factor;
}

/**
 * Resets the step counter display.
 */
function resetStepCounter() {
  stepCounter = 0;
  steps.innerHTML = 0;
}

/**
 * Returns the amount of steps specified by the animation path. Only edges are
 * counted as steps.
 * 
 * @param {animation path} path the animation path list
 * @returns {int} the amount of steps
 */
function getResultSteps(path) {
  let edgeCounter = 0;
  let element;
  let countEdges = true;

  for (let i = 0; i < path.length; i++) {
    // get element
    element = path[i];
    if (element == 'fullDraw') {
      countEdges = false;
    } else if (element == 'singleDraw') {
      countEdges = true;
    } else {
      if (countEdges && (element instanceof Edge)) {
        edgeCounter++;
      }
    }
  }
  return edgeCounter;
}

/**
 * Scrolls to a node if necessary (when node is off-screen).
 * 
 * @param {Node} element the node to scroll to 
 */
function scrollToElement(element) {
  if (!autoScrollingAllowed) return;

  let x, y = 0;
  x = 260 + element.x * 20;
  y = element.y * 20;

  console.log(element);
  console.log('x: ' + x);
  console.log('nextScrollX: ' + nextScrollX);
  console.log('nextScrollX + 260: ' + (nextScrollX + 260));

  if (x > window.innerWidth - 130 + nextScrollX || x < (nextScrollX + 260)) {
    x -= (window.innerWidth / 2);
    nextScrollX = x;
    window.scrollTo({
      left: x,
      behavior: 'smooth'
    });
  }

  if (y > window.innerHeight + nextScrollY || y < (nextScrollY)) {
    y -= (window.innerHeight / 3);
    nextScrollY = y;
    window.scrollTo({
      top: y,
      behavior: 'smooth'
    });
  }
}

/**
 * Scrolls canvas to initial position.
 */
function scrollToOrigin() {
  window.scrollTo({
    left: 0,
    top: 0,
    behavior: 'smooth'
  });
}

/**
 * Enable or disable auto scrolling
 * 
 * @param {boolean} b allow atuo scrolling 
 */
function setAutoScrollingAllowed(b) {
  autoScrollingAllowed = b;
}

export { start, setSpeedFactor, speedFactor, abort, result, reset, setAutoScrollingAllowed, scrollToOrigin };