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
      algoP1.textContent = 'dijkstra\'s algorithm stores current cost (initially set to infinity) and antecessor for every node in a priority queue. in this process, the attributes of each node will be replaced by new cost and antecessor if there is a lower cost to reach this node in order to provide an optimal path.if the queue is empty all nodes have been processed and the path to target can be tracked with the node\'s antecessors.';
      algoP2.textContent = 'dijkstra\'s algorithm always produces an optimal solution.';
      algoP3.textContent = '';
      break;

    case 'gre': // greedy
      algoName.textContent = 'greedy (naive)';
      algoP1.textContent = 'greedy (naive) algorithms select the optimal choice at each step to solve the problem. therefore, at each node the lowest connecting edge is taken.';
      algoP2.textContent = 'if there is an edge from the current node to the target, this edge is taken without checking for the lowest connecting edge. this algorithm has no chance to revert a step if a deadlock or a cycle occurs in the current path.';
      algoP3.textContent = 'greedy algorithms make fast decisions which might lead to higher costs and possible errors. it does not produce an optimal solution, since decisions are made based on information of single steps.'
      break;

    case 'sma': // smart_greedy
      algoName.textContent = 'greedy (smart)';
      algoP1.textContent = 'greedy (naive) algorithms select the optimal choice at each step to solve the problem. therefore, at each node the lowest connecting edge is taken.if there is an edge from the current node to the target, this edge is taken without checking for the lowest connecting edge.';
      algoP2.textContent = 'unlike greedy (naive), this algorithm does not produce a direct cycle as edges to processed nodes will not be taken. nevertheless, there is no chance to revert a step if a deadlock occurs in the current path.'
      algoP3.textContent = 'greedy algorithms make fast decisions which might lead to higher costs and possible errors. it does not produce an optimal solution, since decisions are made based on information of single steps.'
      break;

    case 'dfs': // depthFirstSearch
      algoName.textContent = 'depth first search';
      algoP1.textContent = 'depth first search algorithm explores the node branch as far as possible before backtracking to expand other nodes skipped in the current branch. a stack is usually used to perform depth first search, since the latest pushed node is explored next. this algorithm finds every possible path to target. after depth first search terminated, the path with lowest cost to target is returned.';
      algoP2.textContent = 'it returns an optimal solution, since every path from start to target is evaluated.'
      algoP3.textContent = '';
      break;

    case 'bfs': // breadthFirstSearch
      algoName.textContent = 'breadth first search';
      algoP1.textContent = 'breadth first search algorithm explores all connecting nodes at current depth before moving on to the nodes at the next level depth. a queue is usually used as a data structure, since the last pushed node is epxlored next. this algorithm finds every possible path to the target. after breadth first search terminated, the path with lowest cost to target is returned.';
      algoP2.textContent = 'it returns an optimal solution, since every path from start to target is evaluated.'
      algoP3.textContent = '';
      break;

    case 'ast': // a* star
      algoName.textContent = 'a* star algorithm';
      algoP1.textContent = 'a* star algorithm stores current cost (initially set to infinity), antecessor and the linear distance to target for every node in a priority queue. the algorithm works similar to dijkstra\'s since the attributes of each node will be replaced by new cost and antecessor if there is a lower cost to reach the node.';
      algoP2.textContent = 'the algorithm skips nodes far from target, since their estimated cost based on known cost and linear distance eliminates them from being part of the shortest path.';
      algoP3.textContent = 'a* star always produces the optimal path if the cost between all nodes relates to their real distance.';
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