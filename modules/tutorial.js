/**
 * Tutorial implementation
 * 
 * Author: Kevin Katzkowski
 * Updated: 11.04.2020
 */

import * as Tooltip from './tooltip.js';
import * as Canvas from './canvas.js';
import * as Animation from './animate.js';
import { graph, resetApplicationState, mobileDevice } from '/app.js';
import * as Graph from './graph.js';

const welcomeWindowContainer = document.getElementById('welcome-window-container');
const closeLanding = document.getElementById('close-landing'),
  startTutorial = document.getElementById('start-tutorial'),
  skipTutorial = document.getElementById('skip-tutorial'),
  abortTutorial = document.getElementById('abort-tutorial'),
  leftBox = document.getElementById('tour-left'),
  topBox = document.getElementById('tour-top'),
  rightBox = document.getElementById('tour-right'),
  bottomBox = document.getElementById('tour-bottom'),
  tooltipAnchor = document.getElementById('tooltip-anchor');

var tutorialActive = false;
var tutorialStep;


closeLanding.addEventListener('click', closeWelcomeWindow, false);
abortTutorial.addEventListener('click', end, false);
skipTutorial.addEventListener('click', closeWelcomeWindow, false);
startTutorial.addEventListener('click', function() { 
  closeWelcomeWindow(); 
  start(); }, false);

/**
 * Closes welcome window.
 */
function closeWelcomeWindow() {
  welcomeWindowContainer.style.display = 'none';
}

/**
 * Starts the tutorial with the initial step.
 */
function start() {
  if(mobileDevice || window.innerWidth < 700) return;

  // clear canvas
  resetApplicationState();

  // get starting graph file
  let file = null, xmlhttp = new XMLHttpRequest();
  xmlhttp.open('GET', 'graphs/tutorial.grph',true);

  // when async ready
  xmlhttp.onreadystatechange = function () {
    // request OK
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      // store file
      file = xmlhttp.responseText;

      // load tutorial graph
      graph.importGraph(file);
      Canvas.update();
      Animation.reset();
      
      // start tutorial
      tutorialActive = true;
      highlightSection(document.getElementById('tour-highlight'));
      showTutorialTooltip(1, document.getElementById('tooltip-anchor'));
      document.getElementById('abort-tutorial').style.display = 'block';
    }
  }
  xmlhttp.send();
}

/**
 * Ends the tutorial.
 */
function end() {
  tutorialActive = false;
  Tooltip.hideAllTooltips();
  removeHighlight();
  document.getElementById('abort-tutorial').style.display = 'none';
}

/**
 * Highlight the specified elment by darkening all others.
 * 
 * @param {HTML element} element the element to be highlighted
 * @param {String} removePadding all: remove all padding, right: remove right padding
 */
function highlightSection(element, removePadding) {
  removeHighlight();

  if(element == undefined) {
    // set left background box to fullscreen
    leftBox.style.top =  '0px';
    leftBox.style.left = '0px';
    leftBox.style.width = window.innerWidth + 'px';
    leftBox.style.height = window.innerHeight + 'px';
    leftBox.style.display = 'block';
    
    return;
  }

  let top = element.getBoundingClientRect().top - 10,
    left = element.getBoundingClientRect().left - 10 < 0 ? 0 : element.getBoundingClientRect().left - 10,
    height = element.getBoundingClientRect().height + 20,
    width = removePadding == 'right' ? element.getBoundingClientRect().width + 5 : element.getBoundingClientRect().width + 20;

  if (removePadding == 'all') {
    top = element.getBoundingClientRect().top;
    left = element.getBoundingClientRect().left;
    height = element.getBoundingClientRect().height;
    width = element.getBoundingClientRect().width;
  } 
  // set left background box
  leftBox.style.top = top + 'px';
  leftBox.style.left = '0px';
  leftBox.style.width = left + 'px';
  leftBox.style.height = height + 'px';
  leftBox.style.display = 'block';

  // set top background box
  topBox.style.top = '0px';
  topBox.style.left = '0px';
  topBox.style.width = '100%';
  topBox.style.height = top + 'px';
  topBox.style.display = 'block';

  // set right background box
  rightBox.style.top = top + 'px';
  rightBox.style.left = left + width + 'px';
  rightBox.style.width = '100%';
  rightBox.style.height = height + 'px';
  rightBox.style.display = 'block';

  // set bottom background box
  bottomBox.style.top = top + height + 'px';
  bottomBox.style.left = '0px';
  bottomBox.style.width = '100%';
  bottomBox.style.height = '100%';
  bottomBox.style.display = 'block';

  // set tooltip anchor
  tooltipAnchor.style.top = top + 'px';
  tooltipAnchor.style.left = left + 10 + 'px';
  tooltipAnchor.style.height = height + 'px';
  tooltipAnchor.style.width = width + 'px';
  tooltipAnchor.style.display = 'none';
}

/**
 * Remove the current highlighting.
 */
function removeHighlight() {
  leftBox.style.display = 'none';
  topBox.style.display = 'none';
  rightBox.style.display = 'none';
  bottomBox.style.display = 'none';
  tooltipAnchor.style.display = 'none';
}

/**
 * Continues with the next step of the tutorial.
 */
function continueTutorial() {
  switch (tutorialStep) {
    case 1:
      showTutorialTooltip(2, document.getElementById('tooltip-anchor'));
      break;

    case 2:
      showTutorialTooltip(3, document.getElementById('tooltip-anchor'));
      break;

    case 3:
      showTutorialTooltip(4, document.getElementById('tooltip-anchor'));
      break;

    case 4:
      highlightSection(document.getElementById('choose-algorithm'));
      showTutorialTooltip(5, document.getElementById('tooltip-anchor'));
      break;

    case 5:
      highlightSection(document.getElementById('start'), 'all');
      showTutorialTooltip(6, document.getElementById('tooltip-anchor'));
      break;

    case 6:
      Tooltip.hideAllTooltips();
      highlightSection(document.getElementById('tour-highlight'));
      tutorialStep = 6.5;
      break;

    case 6.5:
      setTimeout(function () {
        highlightSection(document.getElementById('result-window'), 'all');
        showTutorialTooltip(7, document.getElementById('tooltip-anchor'));
      }, 1000);
      break;

    case 7:
      highlightSection(document.getElementById('result'), 'all');
      showTutorialTooltip(8, document.getElementById('tooltip-anchor'));
      break;

    case 8:
      highlightSection(document.getElementById('further-controls'), 'right');
      showTutorialTooltip(9, document.getElementById('tooltip-anchor'));
      break;

    case 9:
      highlightSection(document.getElementById('checkboxes'));
      showTutorialTooltip(10, document.getElementById('tooltip-anchor'));
      break;

    case 10:
      highlightSection(document.getElementById('export-import-graph'), 'right');
      showTutorialTooltip(11, document.getElementById('tooltip-anchor'));
      break;

    case 11:
      highlightSection(undefined)
      showTutorialTooltip(12, document.getElementById('tooltip-anchor'));
      break;

    case 12:
      end(); // end tutorial 
      break;

    default:
      showTutorialTooltip(123); // case default with error tooltip
      break;
  }
}

/**
 * Displays the tooltip for the specified tutorial step. 
 * 
 * @param {Int} step the tutorial step of the tooltip
 * @param {HTML object} refElement reference element for tooltip positioning
 */
function showTutorialTooltip(step, refElement) {
  Tooltip.hideAllTooltips();
  let tooltip;

  switch (step) {
    case 1:
      tooltip = Tooltip.show(
        refElement,
        'draw a node (1/12)',
        'first, draw another node onto the canvas.'
      );
      Tooltip.showHelp(tooltip, 'draw-node', refElement);
      tutorialStep = 1;
      break;

    case 2:
      tooltip = Tooltip.show(
        refElement,
        'draw an edge (2/12)',
        'connect the new node with the others by drawing an edge and assigning a cost to it. edges are directed, so make sure the new node is reachable!'
      );
      Tooltip.showHelp(tooltip, 'draw-edge', refElement);
      tutorialStep = 2;
      break;

    case 3:
      if (graph.currentStartNode != undefined) {
        Tooltip.show(
          refElement,
          'start node already defined (3/12)',
          'looks like you already defined a start node. good job!',
          'next',
          function () { continueTutorial(); }
        );
      } else {
        tooltip = Tooltip.show(
          refElement,
          'set a start node (3/12)',
          'the start node is the algorithms entry point.'
        );
        Tooltip.showHelp(tooltip, 'start-node', refElement);
      }
      tutorialStep = 3;
      break;

    case 4:
      if (graph.currentEndNode != undefined) {
        Tooltip.show(
          refElement,
          'target node already defined(4/12)',
          'looks like you already defined a target node. good job!',
          'next',
          function () { continueTutorial(); }
        );
      } else {
        tooltip = Tooltip.show(
          refElement,
          'set a target node (4/12)',
          'the target node is node which the algorithms is trying to reach.'
        );
        Tooltip.showHelp(tooltip, 'target-node', refElement);
      }
      tutorialStep = 4;
      break;

    case 5:
      Tooltip.show(
        refElement,
        'select algorithm (5/12)',
        'select an algorithm to execute on your graph.'
      );
      tutorialStep = 5;
      break;

    case 6:
      Tooltip.show(
        refElement,
        'run algorithm (6/12)',
        'now run the selected algorithm!'
      );
      tutorialStep = 6;
      break;

    case 7:
      Tooltip.show(
        refElement,
        'execution state (7/11)',
        'the algorithms execution state and result are displayed here.',
        'next',
        function () { continueTutorial(); }
      );
      tutorialStep = 7;
      break;

    case 8:
      Tooltip.show(
        refElement,
        'instant algorithm result (8/12)',
        'if you don\'t want to wait for the algorithm to run completely, you can click on this button to display the result instantly.',
        'next',
        function () { continueTutorial(); }
      );
      tutorialStep = 8;
      break;

    case 9:
      Tooltip.show(
        refElement,
        'execution speed, random graphs and canvas clearing (9/12)',
        'using the sliders, you can tweak the execution speed and the random graph size. click on the buttons to clear the canvas or to generate a random graph.',
        'next',
        function () { continueTutorial(); }
      );
      tutorialStep = 9;
      break;

    case 10:
      Tooltip.show(
        refElement,
        'distanced edges mode and auto scrolling (10/12)',
        'in distanced edges mode, the cost of an edge is dependend on its physical length and automatically set and updated. <br>auto scrolling is used to show the execution path of graphs larger than the window.',
        'next',
        function () { continueTutorial(); }
      );
      tutorialStep = 10;
      break;


    case 11:
      Tooltip.show(
        refElement,
        'import/export graph (11/12)',
        'you can save your graphs and reuse them later by importing them again.',
        'next',
        function () { continueTutorial(); }
      );
      tutorialStep = 11;
      break;
    
    case 12:
      tooltip = Tooltip.show(
        refElement,
        'key bindings (12/12)',
        'use <span class="key-press">ctrl + z</span> to undo and <span class="key-press">ctrl + y</span> to redo an action. you can drag the canvas with <span class="key-press">space + left mouse</span>. click on help to restart this tutorial and for more information.',
        'finish',
        function () { continueTutorial(); }
      );

      // place in center of screen
      tooltip.classList.replace('pos-left', 'pos-center');
      tooltip.style.removeProperty('top');
      tooltip.style.removeProperty('right');
      tutorialStep = 12;
      break;

    default:
      Tooltip.show(
        refElement,
        'unexpected error',
        'an unexpected error occured. reload the page and restart the tutorial.',
        'reload',
        function () { location.reload(); }
      );
      break;
  }
}

export { start, tutorialActive, continueTutorial, tutorialStep }