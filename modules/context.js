/**
 * Context menu implementation for user interface interaction.
 *
 * Authors: Kevin Katzkowski
 * Updated: 26.02.2020
 */

import * as App from '/app.js';
import { Node } from './node.js';
import * as Canvas from './canvas.js';
import * as Tooltip from './tooltip.js';
import { saveCurrentState } from './undo-redo.js';
import { getSidebarWidth } from './sidebar.js';
import * as Tutorial from './tutorial.js';

// context menu elements for shorter reference in code
const contextDeleteNode = document.getElementById('context-delete-node'),
  contextDeleteEdge = document.getElementById('context-delete-edge'), contextValue = document.getElementById('context-value'),
  contextValueEdge = document.getElementById('context-value-edge'),
  contextColor = document.getElementById('context-color'),
  contextStartNode = document.getElementById('context-start-node'),
  contextTargetNode = document.getElementById('context-target-node'),
  contextSubmitEdgeValue = document.getElementById('submit-edge-value');

// true when a context menu is currently visible
var contextMenuVisible = false;

/**
 * Displays the specified menu at the specified pixel position while hiding
 * all other menus.
 * 
 * @param {string} menuID the css id of the menu 
 * @param {int} x the x position in pixels
 * @param {int} y the y position in pixels
 */
function showMenu(menuID, x, y) {
  // hide all currently displayed menus
  hideAllMenus();

  // set menu position of new menu
  setMenuPosition(menuID, x, y);

  // display menu
  setMenuVisiblity(menuID, 'visible');

  // update member variable
  contextMenuVisible = true;
}

/**
 * Sets the visibility of the specified menu according to the command.
 * 
 * @param {string} menuID the css id of the menu 
 * @param {string} command a valid value for the css visibility property
 */
function setMenuVisiblity(menuID, command) {
  let menu = document.getElementById(menuID);

  // display or hide menu depending on command
  menu.style.visibility = command;
}

/**
 * Hides all context menus.
 */
function hideAllMenus() {
  // context menu node
  setMenuVisiblity('context-menu-node', 'hidden');

  // context menu edge
  setMenuVisiblity('context-menu-edge', 'hidden');

  // node color context menu
  setMenuVisiblity('context-menu-node-color', 'hidden');

  // node value context menu
  setMenuVisiblity('context-menu-node-value', 'hidden');

  // edge value context menu
  setMenuVisiblity('context-menu-edge-value', 'hidden');

  // update member variable
  contextMenuVisible = false;
}


/**
 * Sets the position of the specified menu correctly by preventing off-screen
 * placements.
 * 
 * @param {string} menuID the css id of the menu
 * @param {int} x the x position in pixels
 * @param {int} y the y position in pixels
 */
function setMenuPosition(menuID, x, y) {
  let menu = document.getElementById(menuID);
  var height = menu.offsetHeight;
  var width = menu.offsetWidth;

  // check if context menu would be placed off-screen for x value
  if (x + width >= window.innerWidth + window.scrollX) {
    // place menu on screen
    menu.style.left = (x - width) + 'px';
  } else {
    menu.style.left = x + 'px';
  }

  // check if context menu would be placed off-screen for y value
  if (y + height >= window.innerHeight + window.scrollY) {
    // place menu on screen
    menu.style.top = (y - height) + 'px';
  } else {
    menu.style.top = y + 'px';
  }

  //  overlapping with info window
  let infoWindow = document.getElementById('info-window'),
    infoY = infoWindow.getBoundingClientRect().top + window.scrollY,
    infoX = infoWindow.getBoundingClientRect().left + window.scrollX,
    infoHeight = infoWindow.getBoundingClientRect().height;

  if (y >= infoY && y <= infoY + infoHeight && x + width >= infoX) {
    // place on left side
    menu.style.left = (x - width) + 'px';
  } else if (y <= infoY && y + height <= infoY + infoHeight
    && x + width >= infoX) {
    // place on left side
    menu.style.left = (x - width) + 'px';
  }

  // overlapping with result window
  let resultWindow = document.getElementById('result-window'),
    resultY = resultWindow.getBoundingClientRect().top + window.scrollY,
    resultX = resultWindow.getBoundingClientRect().left + window.scrollX,
    resultHeight = resultWindow.getBoundingClientRect().height;

  if (y >= resultY && y <= resultY + resultHeight && x + width >= resultX) {
    // place on left side
    menu.style.left = (x - width) + 'px';
  }

  // overlapping with minimap
  let minimap = document.getElementById('minimap'),
    minimapY = minimap.getBoundingClientRect().top + window.scrollY,
    minimapX = minimap.getBoundingClientRect().left + window.scrollX,
    minimapHeight = minimap.getBoundingClientRect().height;

  if (y >= minimapY && y <= minimapY + minimapHeight && x + width >= minimapX) {
    // place on left side  
    menu.style.left = (x - width) + 'px';
  } else if (y <= minimapY && y + height >= minimapY && x + width >= minimapX) {
    if (x >= minimapX) {
      // place on above
      menu.style.top = (y - height) + 'px';
    } else {
      // place on left side
      menu.style.left = (x - width) + 'px';
    }
  }

  console.log('minimap position: ' + minimapX + ', ' + minimapY);
  console.log(menuID + ' position: ' + x + ', ' + y);
}


/**
 * Deletes last selected node.
 */
contextDeleteNode.addEventListener('click', () => {
  App.graph.deleteNode(App.getLastSelectedNode());
  hideAllMenus();
  Canvas.update();

  // save to undo history
  saveCurrentState()
});

/**
 * Deletes last selected edge.
 */
contextDeleteEdge.addEventListener('click', () => {
  App.graph.deleteEdge(App.getLastSelectedEdge());
  hideAllMenus();
  Canvas.update();

  // save to undo history
  saveCurrentState()
});

/**
 * On node context menu option click, show context menu of last selected node 
 * to change value.
 */
contextValue.addEventListener('click', evt => {
  showContextValue(evt);
});


/**
 * Shows context menu to change last selected node's value. 
 * 
 * @param {browser event} evt browser event
 */
function showContextValue(evt) {
  // 19 is needed for offset
  showMenu('context-menu-node-value', getSidebarWidth() + 19 + (App.getLastSelectedNode().x * 20), 20 + App.getLastSelectedNode().y * 20);

  let inputField = document.getElementById('new-node-value');
  inputField.value = App.getLastSelectedNode().value;
  inputField.setAttribute('spellcheck', 'false');
  inputField.select();
}

/**
 * On save button click event in the change value context menu of the last
 * selected node, check if new value is valid and then assign value or reopen
 * context menu. 
 */
document.getElementById('submit-node-value').addEventListener('click', evt => {
  console.log('submit click');
  // get value from input field
  const value = document.getElementById('new-node-value').value;

  // update base value
  let replacedValue = App.getLastSelectedNode().value

  // test node for existance
  let testNode = new Node(value, -1, -1);

  // update selected node 
  if (App.graph.nodeInGraph(testNode) && value != App.getLastSelectedNode().value) {
    hideAllMenus();
    // show feedback
    Tooltip.showSmall(
      document.getElementById('context-menu-node-value'),
      'duplicate node',
      'a node with this value already exists, enter another value.',
    );

    showContextValue(evt);
  } else if (!App.getLastSelectedNode().changeValue(value)) {
    hideAllMenus();
    // show feedback
    Tooltip.showSmall(
      document.getElementById('context-menu-node-value'),
      'invalid input',
      'valid: A, A\', A\'\', a, a\', a\'\''
    );

    showContextValue(evt);
    // show feedback
    Tooltip.showSmall(
      document.getElementById('context-menu-node-value'),
      'invalid input',
      'valid: A, A\', A\'\', a, a\', a\'\''
    );

  } else {
    App.graph.updateBaseValues(replacedValue, value);
    hideAllMenus();
    Canvas.update();

    // save to undo history
    saveCurrentState()
  }
});

/**
 * On edge context menu option click, show context menu of last selected edge 
 * to change value.
 */
contextValueEdge.addEventListener('click', () => {
  if (App.graph.isDistanced) {
    let tooltip = Tooltip.show(
      contextValueEdge,
      'distanced edges mode active',
      'you cannot assign custom values to edges in distanced edges mode.',
      'switch off',
      function() { 
        // App.graph.isDistanced = false;
        document.getElementById('checkbox-distanced-edges').click();
        showContextValueEdge();
       },
      'cancel',
      function() { hideAllMenus(); }
    );

    // make tooltip scrolling 
    tooltip.style.position = 'absolute';

     // redraw edge overlay
    App.getLastSelectedEdge().drawOverlay(Canvas.ctx);
  } else {
    showContextValueEdge();
  }
});

/**
 * Shows context menu to change last selected edge's value. 
 * 
 * @param {browser event} evt browser event
 */
function showContextValueEdge() {
  // redraw edge overlay
  App.getLastSelectedEdge().drawOverlay(Canvas.ctx);

  // show context menu to change edge value
  showMenu('context-menu-edge-value',
    getSidebarWidth() + (App.getLastSelectedEdge().startNode.x + (App.getLastSelectedEdge().endNode.x - App.getLastSelectedEdge().startNode.x) / 2) * 20,
    (App.getLastSelectedEdge().startNode.y + (App.getLastSelectedEdge().endNode.y - App.getLastSelectedEdge().startNode.y) / 2) * 18);

  // set initial input field value
  document.getElementById('new-edge-value').value = App.getLastSelectedEdge().cost;
  document.getElementById('new-edge-value').select();
}

/**
 * Shows choose color context menu for last selected node.
 */
contextColor.addEventListener('click', () => {
  // 19 is needed for offset
  showMenu('context-menu-node-color', getSidebarWidth() + 19 + (App.getLastSelectedNode().x * 20), 20 + App.getLastSelectedNode().y * 20);

  let colorButtons = Array.from(document.getElementsByClassName('colors'));
  colorButtons.forEach(function (button) {
    // set button color
    button.style.background = getComputedStyle(document.body).getPropertyValue('--color-node-' + button.dataset.color);

    // set onclick event listener
    button.addEventListener('click', function () {

      // change color of current node
      App.getLastSelectedNode().color = getComputedStyle(document.body).getPropertyValue('--color-node-' + button.dataset.color);

      // apply color change for all following nodes
      App.setNodeColor(getComputedStyle(document.body).getPropertyValue('--color-node-' + button.dataset.color));
      hideAllMenus();
      Canvas.update();

      // save to undo history
      saveCurrentState()
    });
  });
});

/**
 * Sets last selected node as start node.
 */
contextStartNode.addEventListener('click', () => {
  // do not allow a node to be start and target node 
  App.getLastSelectedNode().isFinish = false;

  // reset other start nodes
  App.graph.getNodeList().forEach(node => {
    if (node != App.getLastSelectedNode()) {
      node.isStart = false;
    }
  });

  // toggle node state
  App.getLastSelectedNode().isStart = !(App.getLastSelectedNode().isStart);

  // set graph start node
  if (App.getLastSelectedNode().isStart) {
    App.graph.currentStartNode = App.getLastSelectedNode();
  } else {
    App.graph.currentStartNode = undefined;
  }

  // if node was target node before, set graph end node as undefined
  if (App.graph.currentEndNode == App.getLastSelectedNode()) {
    App.graph.currentEndNode = undefined;
  }

  hideAllMenus();
  Canvas.update();

  // save to undo history
  saveCurrentState()

  // during tutorial, go to next step
  if (Tutorial.tutorialActive && Tutorial.tutorialStep == 3) {
    Tutorial.continueTutorial();
  }
});

/**
 * Sets last selected node as target node.
 */
contextTargetNode.addEventListener('click', () => {
  // do not allow a node to be start and target node
  App.getLastSelectedNode().isStart = false;

  // reset other target nodes
  App.graph.getNodeList().forEach(node => {
    if (node != App.getLastSelectedNode()) {
      node.isFinish = false;
    }
  });

  // toggle node state
  App.getLastSelectedNode().isFinish = !(App.getLastSelectedNode().isFinish);

  // set graph target node
  if (App.getLastSelectedNode().isFinish) {
    App.graph.currentEndNode = App.getLastSelectedNode();
  } else {
    App.graph.currentEndNode = undefined;
  }

  // if node was start node before, set graph start node as undefined
  if (App.graph.currentStartNode == App.getLastSelectedNode()) {
    App.graph.currentStartNode = undefined;
  }

  hideAllMenus();
  Canvas.update();

  // save to undo history
  saveCurrentState()

  // during tutorial, go to next step
  if (Tutorial.tutorialActive && Tutorial.tutorialStep == 4) {
    Tutorial.continueTutorial();
  }
});

/**
 * On save button click event in the change value context menu of the last
 * selected edge, check if new value is valid and then assign value or reopen
 * context menu. 
 */
contextSubmitEdgeValue.addEventListener('click', () => {
  // get value from input field
  const cost = document.getElementById('new-edge-value').value;

  // update selected edge if cost is valid
  if (!App.getLastSelectedEdge().changeCost(cost)) {
    hideAllMenus();
    // show feedback
    Tooltip.showSmall(
      document.getElementById('context-menu-edge-value'),
      'invalid input',
      'valid input: values from 0 to 999.',
    );
    showContextValueEdge();
  } else {
    App.getLastSelectedEdge().cost = cost;
    hideAllMenus();
    Canvas.update();

    // save to undo history
    saveCurrentState()

    // during tutorial, go to next step
    if (Tutorial.tutorialActive && Tutorial.tutorialStep == 2) {
      Tutorial.continueTutorial();
    }
  }
});

export { contextStartNode, contextTargetNode, contextMenuVisible, showMenu, hideAllMenus }
