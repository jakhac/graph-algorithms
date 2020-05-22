/**
 * Implementation of the undo functionality for the UI.
 * 
 * Authors: Jakob Hackstein, Kevin Katzkowski
 * Updated: 27.02.2020
*/

import { graph } from '/app.js';

// store change history
const history = [];

// current state index in history array
var currentIndex = 0;

/**
 * Save current graph state, unless the change graph is exactly the same.
 * 
 * @returns {boolean} true, if undoHistory was changed.
 */
function saveCurrentState() {

  let newState = graph.convertToString();

  // store initial state
  if (history.length == 0) {
    history.push(newState);
    return true;
  }

  if (newState == history[currentIndex]) {
    // return if state was not changed
    return false;
  } else if (currentIndex + 1 < history.length &&
    newState != history[currentIndex + 1]) {

    // delete redo history and add new state
    currentIndex++;
    history.splice(currentIndex, history.length, newState);
  } else {
    // push state to history if no redo history exists
    currentIndex++;
    history.push(newState);
  }
  return true;
}

/**
 * Restore latest graph change in graph data structure.
 */
function undo() {
  let lastState;

  // if not last element in history
  if (currentIndex != 0) {
    currentIndex--;

    lastState = history[currentIndex];

    // load state
    graph.importGraph(lastState);
    return true;
  } else {
    return false;
  }
}

/**
 * Reverse latest undo graph data structure.
 */
function redo() {
  let nextState;

  if (currentIndex + 1 < history.length) {
    currentIndex++;
    nextState = history[currentIndex];

    // load state
    graph.importGraph(nextState);
    return true;
  } else {
    return false;
  }
}

export { undo, redo, saveCurrentState };