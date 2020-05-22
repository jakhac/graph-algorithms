/**
 * This file contains all functions relevant to selecting an algorithm in the UI
 * 
 * Author: Kevin Katzkowski
 * Updated: 26.02.2020
*/

import * as Animation from './animate.js';
import { getAnimating } from '/app.js';
import * as Tooltip from './tooltip.js';
import * as Tutorial from './tutorial.js';

// currently selected algorithm
var key;

// containers with arrow to collapse and expand algorithm info/result container 
const infoArrowContainer = document.getElementById('info-collapse-container'),
  resultArrowContainer = document.getElementById('result-collapse-container');

// store algorithm info containers
const algoName = document.getElementById('algo-name'),
  algoP1 = document.getElementById('algo-p1'),
  algoP2 = document.getElementById('algo-p2'),
  algoP3 = document.getElementById('algo-p3');

// store algorithm selection buttons
const alg1Button = document.getElementById('alg-1'),
  alg2Button = document.getElementById('alg-2'),
  alg3Button = document.getElementById('alg-3'),
  alg4Button = document.getElementById('alg-4'),
  alg5Button = document.getElementById('alg-5'),
  alg6Button = document.getElementById('alg-6');

// algorithm selection event listerns
alg1Button.addEventListener('click', evt => handleButtonClick(evt));
alg2Button.addEventListener('click', evt => handleButtonClick(evt));
alg3Button.addEventListener('click', evt => handleButtonClick(evt));
alg4Button.addEventListener('click', evt => handleButtonClick(evt));
alg5Button.addEventListener('click', evt => handleButtonClick(evt));
alg6Button.addEventListener('click', evt => handleButtonClick(evt));

/**
 * Handles a click on an algorithm button.
 * 
 * @param {browser event} evt browser click event 
 */
function handleButtonClick(evt) {
  if (getAnimating()) {
    // show dialog to confirm
    Tooltip.show(
      evt.target,
      'execution will be aborted',
      'selecting another algorithm will abort the current execution.',
      'abort',
      function () {
        selectAlgorithm(evt);
      },
      'cancel'
    );
  } else {
    selectAlgorithm(evt);

    // during tutorial, go to next step
    if (Tutorial.tutorialActive) {
      Tutorial.continueTutorial();
    }
  }
}

/**
 * Selects an algorithm for execution.
 * 
 * @param {browser event} evt browser click event 
 */
function selectAlgorithm(evt) {
  deselectAlgButtons();
  evt.target.classList.add('selected');
  key = evt.target.getAttribute('data-alg-key');
  loadAlgoInfo(key);
}

/**
 * Deselect all algorithm selection buttons
 */
function deselectAlgButtons() {
  alg1Button.classList.remove('selected');
  alg2Button.classList.remove('selected');
  alg3Button.classList.remove('selected');
  alg4Button.classList.remove('selected');
  alg5Button.classList.remove('selected');
  alg6Button.classList.remove('selected');

  key = 'default';
}

/**
 * Load information for specified algorithm into sidebar.
 * @param {string} key the algorithm 
 */
function loadAlgoInfo(key) {
  Animation.reset();
  switch (key) {
    case 'dij': // dijkstra
      algoName.textContent = 'dijkstra\'s algorithm';
      algoP1.textContent = 'dijkstra\'s algorithm stores current costs (initially set to infinity) and antecessor for every node in a priority queue.';
      algoP2.textContent = 'the attributes of each node will be updated by lower costs and antecessors in order to provide an optimal path. If the queue is empty the path to finish can be tracked with the antecessors. ';
      algoP3.textContent = 'dijkstra\'s algorithm always produces an optimal solution.';
      break;

    case 'gre': // greedy
      algoName.textContent = 'greedy (naive)';
      algoP1.textContent = 'the greedy (naive) algorithm makes the optimal choice at each step to solve the problem. at each node the lowest connecting edge is taken until finish is reached.';
      algoP2.textContent = 'it does not produce an optimal solution, since decisions are made based on information of single steps.'
      algoP3.textContent = '';
      break;

    case 'sma': // smart_greedy
      algoName.textContent = 'greedy (smart)';
      algoP1.textContent = 'the greedy (smart) algorithm makes the optimal choice at each step, so that the problem can still be solved. at each node the lowest connecting edge will be taken, if the edge does not produce a cycle.';
      algoP2.textContent = 'It does not produce an optimal solution, since decisions are made based on information of single steps.'
      algoP3.textContent = 'greedy (smart) algorithm makes the optimal choice at each step, so that the problem can still be solved. at each node the lowest connecting edge will be taken, if the edge does not produce a cycle.greedy (smart) algorithm makes the optimal choice at each step, so that the problem can still be solved. at each node the lowest connecting edge will be taken, if the edge does not produce a cycle.';
      break;

    case 'dfs': // depthFirstSearch
      algoName.textContent = 'depth first search';
      algoP1.textContent = 'the depth first search algorithm explores the node branch as far as possible before backtracking to expand other nodes skipped in the current branch.';
      algoP2.textContent = 'this algorithm finds all possible paths to finish and therefore produces the optimal solution.'
      algoP3.textContent = '';
      break;

    case 'bfs': // breadthFirstSearch
      algoName.textContent = 'breadth first search';
      algoP1.textContent = 'the breadth first search algorithm explores all connecting nodes at current depth before moving on the nodes at the next level depth.';
      algoP2.textContent = 'this algorithm finds all possible paths to finish and therefore produces the optimal solution.'
      algoP3.textContent = '';
      break;

    case 'ast': // a* star
      algoName.textContent = 'a* star algorithm';
      algoP1.textContent = 'the a* star algorithm stores current costs (initially set to infinity), antecessor and the linear distance to finish for every node in a priority queue.';
      algoP2.textContent = 'a* star always produces the optimal path if the distance calculation is correct.';
      algoP3.textContent = '';
      break;

    default:
      algoName.textContent = 'about this tool';
      algoP1.textContent = 'using this tool, you can interactively visualize graph algorithms.'
      algoP2.textContent = 'draw a graph onto the canvas or generate a random one. then choose an algorithm from the list above and click \'start\' to see how it executes.';
      algoP3.textContent = 'for help, click on the help button.';
  }
}

/**
 * Collapse or expand the algorithm info container when the arrow container 
 * has been clicked.
 */
infoArrowContainer.addEventListener('click', () => {
  let infoArrow = document.getElementById('info-arrow');

  if (infoArrow.className == 'right') {
    // collapse info container
    document.getElementById('info-window').style.right = '-300px';
    infoArrow.classList.remove('right');
    infoArrow.classList.add('left');
    infoArrowContainer.classList.add('collapsed');
  } else {
    // expand info container
    document.getElementById('info-window').style.right = '0px';
    infoArrow.classList.remove('left');
    infoArrow.classList.add('right');
    infoArrowContainer.classList.remove('collapsed');
  }
});

/**
 * Collapse or expand the algorithm result container when the arrow container 
 * has been clicked.
 */
resultArrowContainer.addEventListener('click', () => {
  let resultArrow = document.getElementById('result-arrow');

  if (resultArrow.className == 'right') {
    // collapse result container
    document.getElementById('result-window').style.right = '-300px';
    resultArrow.classList.remove('right');
    resultArrow.classList.add('left');
    resultArrowContainer.classList.add('collapsed');
  } else {
    // expand result container
    document.getElementById('result-window').style.right = '0px';
    resultArrow.classList.remove('left');
    resultArrow.classList.add('right');
    resultArrowContainer.classList.remove('collapsed');
  }
});

/**
 * Returns the 3 char key for the currently selected algorithm.
 */
function getSelectedAlgorithmKey() {
  return key;
}

export { getSelectedAlgorithmKey, deselectAlgButtons, loadAlgoInfo }