/**
 * This file contains all the main functions required for graph drawing.
 *
 * Author: Kevin Katzkowski
 * Updated: 28.02.2020
 */

import * as Canvas from './modules/canvas.js';
import * as Context from './modules/context.js';
import { Node } from './modules/node.js';
import { Edge } from './modules/edge.js';
import * as AlgoSelect from './modules/algorithm-selection.js';
import * as Animation from './modules/animate.js';
import * as Minimap from './modules/minimap.js';
import * as Tooltip from './modules/tooltip.js';
import { saveCurrentState, undo, redo } from './modules/undo-redo.js';
import { getSidebarWidth, updateTheme } from './modules/sidebar.js';
import * as Tutorial from './modules/tutorial.js';

/** 
 * global dragging state: true when a node was recently dragged
 */
var dragging = false;

/**
 * global selection state: true when a node is selected
 */
var selection = false;

/**
 * global edge drawing state: true when an edge is being drawn
 */
var drawingEdge = false;

/**
 * global animation state: true when result is being animated
 */
var animating = false;

/**
 * global canvas panning state: true when canvas is being panned
 */
var panning = false;

/**
 * true when panning key is pressed
 */
var panningAllowed = false;

/**
 * timeout id for keyup event to end panning
 */
var panningTimeoutID;

/**
 * true when user is visiting via a mobile device
 */
var mobileDevice = false;

// initial window scroll values for panning
var distanceToTop, distanceToLeft;

// initial mouse position values for panning
var panningInitialX, panningInitialY;

/**
 * true when the mouse is on the canvas
 */
var mouseOnCanvas = false;

/**
 * base node color from css stylesheet
 */
var nodeColor = getComputedStyle(document.body).getPropertyValue('--color-primary');

// the current graph
const graph = Canvas.graph;

// copy website link (on mobile page)
const copyButton = document.getElementById('copy');

// important references to use in multiple event listeners
var lastSelectedNode, lastSelectedEdge, edgeStartNode, edgeTargetNode;

// set the correct theme
updateTheme();

// draw the grid initially
Canvas.drawGrid();
Minimap.drawMiniMap();
Animation.scrollToOrigin();
saveCurrentState();

/**
 * Copies website link to clipboard (mobile and touch devices)
 */
copyButton.addEventListener('click', () => {
  let copyLink = document.getElementById('copy-link');
  copyLink.select();
  copyLink.setSelectionRange(0, 99999); // mobile devices

  document.execCommand("copy");
  alert('link copied!');
});

/**
 * Displays mobile page on touch event.
 */
window.addEventListener('touchstart', () => {
  mobileDevice = true;

  // set touch page styles
  document.documentElement.style.overflow = 'hidden';
  document.documentElement.style.position = 'relative';
  document.documentElement.style.fontSize = '90%';

  // change text to suit for touch devices
  document.getElementById('helper-desktop').innerHTML = 'if you are seeing this on a desktop device with touch input, reload the page.'

  // display mobile page
  document.getElementById('mobile-page').style.display = 'inline-block';
  console.log('touchevent');
});

/**
 * Handles canvas click event. Draws a new edge or a new node when possible.
 */
Canvas.canvas.addEventListener('click', evt => {
  // mouse is on canvas
  mouseOnCanvas = true;

  if (panning || panningAllowed || animating) {
    return;
  } else if (Context.contextMenuVisible) {
    // do not draw a node when context menu is visible
    Context.hideAllMenus();

  } else if (edgeTargetNode != undefined) {
    drawEdgeIfPossible();
    deselectAllNodes();

    // disable edge drawing state
    drawingEdge = false;
  } else if (drawingEdge) {
    // get canvas grid position
    let position = Canvas.getCanvasPosition(evt);

    // try drawing a new node
    let targetNode = drawNodeIfPossible(position.x, position.y);

    // if drawing node succeeded
    if (targetNode != undefined) {
      edgeTargetNode = targetNode;
      drawEdgeIfPossible();
    } else {
      endEdgeDrawing();
    }
  } else {
    // get canvas grid position
    let position = Canvas.getCanvasPosition(evt);

    // try drawing a new node
    let node = drawNodeIfPossible(position.x, position.y);

    // if drawing node failed
    if (node == undefined) {
      selectNodeAtClickPosition(position.x, position.y);
    } else if (Tutorial.tutorialActive && Tutorial.tutorialStep == 1) {
      // during tutorial continue with next step
      Tutorial.continueTutorial();
    }
  }
});

/**
 * Handles canvas mousedown event. On left button mousedown, activate canvas 
 * panning or set node into dragging state.
 */
Canvas.canvas.addEventListener('mousedown', evt => {
  evt.preventDefault();
  console.log('canvas mousedown');

  // mouse is on canvas
  mouseOnCanvas = true;

  // on left button mousedown
  if (evt.button == 0) {

    if (panningAllowed) {
      panning = true;
      // initial scroll values
      distanceToLeft = window.scrollX;
      distanceToTop = window.scrollY;
      console.log('scroll left: ' + distanceToLeft);
      console.log('scroll top: ' + distanceToTop);

      // initial mouse position
      panningInitialX = evt.clientX;
      panningInitialY = evt.clientY;
      console.log('mousedown panning');
    } else if (animating) {
      return;
    } else {
      // get canvas position
      let position = Canvas.getCanvasPosition(evt);

      // get node at position
      let node = Canvas.getNodeAtCoordinates(position.x, position.y);
      setNodeDragging(node);
    }
  }
});

/**
 * Handles canvas mousemove event. On mousemove, pan the canvas, drag a node
 * or draw a new edge draft.
 */
Canvas.canvas.addEventListener('mousemove', evt => {
  // mouse is on canvas
  mouseOnCanvas = true;

  // handle canvas panning
  if (panning && panningAllowed) {
    console.log('mousemove panning');

    let positionDeltaX = evt.clientX - panningInitialX;
    let positionDeltaY = evt.clientY - panningInitialY;

    console.log('deltaX: ' + positionDeltaX);
    console.log('deltaY: ' + positionDeltaY);

    let newX = distanceToLeft - positionDeltaX;
    let newY = distanceToTop - positionDeltaY;

    window.scrollTo({
      top: newY,
      left: newX
    });

    return;
  } else if (animating) {
    // do not allow moving nodes when animating
    return;
  }
  
  // get dragging node
  graph.getNodeList().forEach(node => {
    if (node.dragging) {
      // get canvas position
      let position = Canvas.getCanvasPosition(evt);
      let dx = position.x;
      let dy = position.y;

      // check all fields of where new node would be drawn
      let field1 = Canvas.getNodeAtCoordinates(dx, dy);
      let field2 = Canvas.getNodeAtCoordinates(dx + 1, dy);
      let field3 = Canvas.getNodeAtCoordinates(dx, dy + 1);
      let field4 = Canvas.getNodeAtCoordinates(dx + 1, dy + 1);

      // check if new position is out of canvas bounds
      let maxX = Canvas.gridData.length;
      let maxY = Canvas.gridData[0].length;
      if ((dx + 1) < maxX && (dy + 1) < maxY) {

        // if fields are empty or filled with this node
        if ((field1 == undefined || field1 == node) &&
          (field2 == undefined || field2 == node) &&
          (field3 == undefined || field3 == node) &&
          (field4 == undefined || field4 == node)) {

          // redraw node at new x position
          if (dx == node.x + 1) {
            // do nothing if mouse is still on node area
          } else if (dx == node.x + 2 && dx != maxX - 2) {
            // drag node to the right
            node.x = dx - 1;
          } else {
            // drag node to the left
            node.x = dx;
          }

          // redraw node at new y position
          if (dy == node.y + 1) {
            // do nothing if mouse is still on node area
          } else if (dy == node.y + 2 && dy != maxY - 2) {
            // drag node to the bottom
            node.y = dy - 1;
          } else {
            // drag node to the top
            node.y = dy;
          }

          // set global dragging state
          dragging = true;
        }
        Canvas.update();
      } else {
        // disable dragging state if mouse is out of canvas area
        node.dragging = false;
      }
      
    } else if (node.selected) {
      startEdgeDrawing(evt, node);
    }
  });
});

/**
 * Handles canvas mouseleave event. On mouseleave, set mouseOnCanvas to false.
 */
Canvas.canvas.addEventListener('mouseleave', () => {
  console.log('canvas mouseleave');
  
  mouseOnCanvas = false;
})

/**
 * Handles canvas mouseenter event. On mouseenter, set mouseOnCanvas to true.
 */
Canvas.canvas.addEventListener('mouseenter', () => {
  console.log('canvas mouseenter');

  mouseOnCanvas = true;
});

/**
 * On contextmenu, hide default context menu and show custom context menu for 
 * last selected node or edge.
 */
Canvas.canvas.addEventListener('contextmenu', evt => {
  evt.preventDefault();
  if (animating) return;

  endEdgeDrawing();
  deselectAllNodes();

  let coordinates = Canvas.getCanvasMousePosition(evt);

  // save floored values for node detection
  let floorX = Math.floor(coordinates.x / 20),
    floorY = Math.floor(coordinates.y / 20);

  // check for exisiting node
  let tempNode = Canvas.getNodeAtCoordinates(floorX, floorY);

  // show node context menu
  if (tempNode != undefined) {
    tempNode.print();
    // set context menu text correctly for start toggle
    if (!tempNode.isStart) {
      // change text if node is being marked as a normal node
      Context.contextStartNode.innerHTML = "set start";
    } else {
      // change text if node is being marked as a start node
      Context.contextStartNode.innerHTML = "undo start";
    }

    // set context menu text correctly for target toggle
    if (!tempNode.isFinish) {
      // change text if node is being marked as a normal node
      Context.contextTargetNode.innerHTML = "set target";
    } else {
      // change text if node is being marked as a start node
      Context.contextTargetNode.innerHTML = "undo target";
    }

    // show context menu if a node has been clicked
    Context.showMenu('context-menu-node', evt.pageX, evt.pageY);

    // store selected node
    lastSelectedNode = tempNode;
  } else {
    // do not show context menu on random click
    Context.hideAllMenus();

    // show context menu on edge click
    graph.edgeList.forEach(edge => {
      // detect click on edge
      if (Canvas.graphCtx.isPointInStroke(edge.hitbox, coordinates.x, coordinates.y)) {
        // mark selected edge
        lastSelectedEdge = edge;
        lastSelectedEdge.drawOverlay(Canvas.ctx);

        // show context menu for clicked edge
        Context.showMenu('context-menu-edge', evt.pageX, evt.pageY);
        edge.print();
      }
    });
  }
});

/**
 * Handles window mouseup event. 
 */
window.addEventListener('mouseup', evt => {
  console.log('window mouseup event');
  
  // hide tooltips on click but not on tooltip body click
  if (Tooltip.tooltipVisible && !(evt.target.id == 'file-name' || evt.target.id == 'learn-how' || evt.target.className == 'tooltip' || evt.target.id == 'tooltip-title' || evt.target.className == 'tooltip-message' || Tutorial.tutorialActive  || evt.target.className == 'help-gif' || evt.target.className == 'key-press' || (evt.target.className == 'button-bar' && evt.target.parentElement != undefined ? evt.target.parentElement.className == 'tooltip' : false))) {
    Tooltip.hideAllTooltips();
  }

  if (panning) {
    panning = false;
    return;
  }

  if (animating) {
    return;
  }

  // on left button mouseup
  if (evt.button == 0) {
    deselectAllNodes();

    // end edge drawing overlay
    Canvas.update();

    console.log(mouseOnCanvas);
    

    if (!mouseOnCanvas) endEdgeDrawing();
  }
});

/**
 * Handles window resize event. On resize, redraw grid and update canvas.
 */
window.addEventListener('resize', () => {
  Canvas.drawGrid();
  Canvas.update();
  console.log('resized');
});

/**
 * On before window reload, show default browser warning.
 */
window.onbeforeunload = function () {
  return true;
};

/**
 * Handles key press events.
 */
document.onkeydown = function (evt) {
  evt = evt || window.event;

  // escape key
  if (evt.keyCode == 27) {
    hideUIOverlays();
  } else if (evt.keyCode == 32) {
    // spacebar: enable panning  
    evt.preventDefault();
    clearTimeout(panningTimeoutID);
    panningAllowed = true;
  } else if (evt.ctrlKey && evt.which == 90) {
    // handle ctrl + z (undo)
    if (animating || panning || panningAllowed || dragging) {
      return;
    } else if (drawingEdge) {
      hideUIOverlays();
      return;
    }

    let undone = undo();
    if (undone) hideUIOverlays();
  } else if (evt.ctrlKey && evt.which == 89) {
    // handle ctrl + y (redo)
    if (animating || panning || panningAllowed || dragging) {
      return;
    }

    let redone = redo();
    if (redone) hideUIOverlays();
  }
};

/**
 * Handles key release events.
 */
document.onkeyup = function (evt) {
  // spacebar: disable panning
  if (evt.keyCode == 32) {
    // clear last delay
    clearTimeout(panningTimeoutID);

    // add delay to prevent drawing a node by accident
    panningTimeoutID = setTimeout(function () {
      panningAllowed = false;
      panning = false;
    }, 150);
  }
}

/**
 * Generate a new random graph and draw it onto the canvas.
 */
function generateRandomGraph() {

  // abort animation if active
  if (animating) {
    Animation.abort();
    animating = false;
  }

  // draw random graph
  graph.randomGraph(nodeColor);
  graph.draw(Canvas.graphCtx);
  Canvas.update();

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });

  // save to undo history
  saveCurrentState()
}

/**
 * Resets application UI state to inital (not undo history).
 */
function resetApplicationState() {
  Canvas.clearCanvas();
  Animation.reset();
  animating = false;

  AlgoSelect.deselectAlgButtons();
  AlgoSelect.loadAlgoInfo('default');

  // save to undo history
  saveCurrentState()
}

/**
 * Removes UI overlay elements and updates the canvas.
 */
function hideUIOverlays() {
  endEdgeDrawing();
  deselectAllNodes();
  Context.hideAllMenus();
  Tooltip.hideAllTooltips();
  Canvas.update();
}

/**
 * Checks if the specified file has .grph file extension.
 * 
 * @param {file} filename the name of the file
 * @returns {boolean} true, when the file extension is .grph, false otherwise
 */
function isGrphExtension(filename) {
  let ext = (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
  return (ext === 'grph');
}

/**
 * Sets the animation state based on the specified boolean value.
 * 
 * @param {boolean} b the boolean value to set the animation state 
 */
function setAnimating(b) {
  animating = b;
}

/**
 * Returns the animation state.
 */
function getAnimating() {
  return animating;
}

/**
 * Returns the last selected node.
 */
function getLastSelectedNode() {
  return lastSelectedNode;
}

/**
 * Returns the last selected edge.
 */
function getLastSelectedEdge() {
  return lastSelectedEdge;
}

/**
 * Sets the node drawing color. 
 * 
 * @param {string} color the color code
 */
function setNodeColor(color) {
  nodeColor = color;
}

/**
 * Deselects all nodes.
 */
function deselectAllNodes() {
  // deselect all nodes
  graph.getNodeList().forEach(node => {
    node.selected = false;
    node.dragging = false;
    selection = false;
  });
  // save to undo history
  saveCurrentState()
}

/**
 * Draws a new node at the specified grid coordinates if possible.
 * 
 * @param {int} x x grid coordinate 
 * @param {int} y y grid coordinate
 * @returns the node drawn node, or undefined
 */
function drawNodeIfPossible(x, y) {
  // no selection for instant node drawing
  if (Canvas.checkValidCoordinates(x, y) && !selection) {
    let value = graph.getNextBaseValue();

    // if maximum amount of nodes has been reached
    if(value == false) {
      // move context menu to click location as an anchor for the tooltip
      let anchorContext = document.getElementById('context-menu-node');
      anchorContext.style.left = getSidebarWidth() + x * 20 - 10 + 'px';
      anchorContext.style.top = y * 20 - anchorContext.getBoundingClientRect().height + 20.5 + 'px';

    Tooltip.showSmall(
      anchorContext,
      'node drawing failed',
      'maximum amount of nodes reached.',
    );

      return undefined;
    }


    // create node in graph dataset format
    let node = new Node(value, x, y, nodeColor);

    // draw and store node in grid
    node.draw(Canvas.graphCtx);
    Canvas.storeNodeAt(node, x, y);
    node.print();

    // add node to graph
    graph.addNode(node);
    graph.printGraph();

    // update minimap
    Minimap.drawMiniMap();

    // save to undo history
    saveCurrentState()
    return node;
  } else {
    return undefined;
  }
}

/**
 * Selects the node at the specified grid coordinates if a node exists.
 * 
 * @param {int} x x grid coordinate 
 * @param {int} y y grid coordinate
 */
function selectNodeAtClickPosition(x, y) {
  let tempNode = Canvas.getNodeAtCoordinates(x, y);

  console.log(tempNode);
  
  // select node on click
  if (tempNode != undefined && !tempNode.selected &&
    !selection && !dragging) {
    // select node
    tempNode.drawOverlay(Canvas.ctx);
    selection = true;
    tempNode.selected = true;

  } else {
    // deselect all nodes
    deselectAllNodes();
    dragging = false;

    Canvas.update();
  }
}

/**
 * Sets the specified node into dragging mode.
 * 
 * @param {Node} node node to be set into dragging mode 
 */
function setNodeDragging(node) {
  // set dragging state
  if (node != undefined) {
    if (node.selected == false) {
      node.dragging = true;
    }
  }
}

/**
 * Draws an edge if possible.
 * 
 * @returns True, when an edge has been drawn, false otherwise.
 */
function drawEdgeIfPossible() {
  // check if edge already exists
  if (edgeStartNode == edgeTargetNode) {
    endEdgeDrawing();
    return false;
  } else if (!graph.isConnected(edgeStartNode, edgeTargetNode)
    && edgeStartNode != edgeTargetNode) {
    // create new edge 
    let edge = new Edge(edgeStartNode, edgeTargetNode, 0, 'black');

    // calculate edge length for default value
    let startX = (edgeStartNode.x * 20 + 20);
    let startY = (edgeStartNode.y * 20 + 20);

    // get target node center
    let targetX = (edgeTargetNode.x * 20 + 20);
    let targetY = (edgeTargetNode.y * 20 + 20);

    // calculate vector length
    let vecLength = Math.sqrt((targetX - startX) * (targetX - startX)
      + (targetY - startY) * (targetY - startY));

    // set edge default cost edge length
    edge.cost = Math.floor(vecLength / 20) - 2;

    // store edge in graph
    edge.draw(Canvas.graphCtx);
    graph.addEdge(edge);

    // if graph is not in distanced edges mode
    if (!graph.isDistanced) {
      // show context menu to change edge value instantly
      Context.showMenu('context-menu-edge-value',
        getSidebarWidth() + (edgeStartNode.x + (edgeTargetNode.x - edgeStartNode.x) / 2) * 20,
        (edgeStartNode.y + (edgeTargetNode.y - edgeStartNode.y) / 2) * 18);

      // set initial input field value
      let inputField = document.getElementById('new-edge-value');
      inputField.value = edge.cost;
      inputField.select();
    }

    lastSelectedEdge = edge;
    endEdgeDrawing();

    // save to undo history
    saveCurrentState();
    return true;
  } else { // edge already exists
    // move context menu to click location as an anchor for the tooltip
    let anchorContext = document.getElementById('context-menu-edge-value');
    anchorContext.style.left = getSidebarWidth() + (edgeStartNode.x + (edgeTargetNode.x - edgeStartNode.x) / 2) * 20;
    anchorContext.style.top = (edgeStartNode.y + (edgeTargetNode.y - edgeStartNode.y) / 2) * 18;

    Tooltip.showSmall(
      anchorContext,
      'duplicate edge',
      'an edge between these nodes already exists, choose another target node.',
    );

    endEdgeDrawing();
    return false;
  }
}

/**
 * Starts drawing an edge draft beginning at the specified node.
 * 
 * @param {event} evt browser event
 * @param {Node} node the node from which the edge draft should be drawn
 */
function startEdgeDrawing(evt, node) {
  // get mouse position for target node
  let mousePos = Canvas.getCanvasMousePosition(evt);

  // draw start node selection and edge from start node
  Canvas.update();

  node.drawOverlay(Canvas.ctx);
  node.drawEdgefrom(Canvas.ctx, mousePos.x, mousePos.y);
  node.selected = true;
  drawingEdge = true;

  // get target node of edge at mouse position
  let targetNode = Canvas.getNodeAtCoordinates(Math.floor(mousePos.x / 20),
    Math.floor(mousePos.y / 20));

  // node at target position exists
  if (targetNode != undefined) {
    targetNode.drawOverlay(Canvas.ctx);
  }

  // store values globally
  edgeStartNode = node;
  edgeTargetNode = targetNode;
}

/**
 * Ends edge drawing globally.
 */
function endEdgeDrawing() {
  drawingEdge = false;
  edgeStartNode = undefined;
  edgeTargetNode = undefined;
  Canvas.update();

  // draw edge overlay if edge value change context menu is visible
  let edgeContextValue = document.getElementById('context-menu-edge-value');
  if (edgeContextValue.style.visibility == 'visible') {
    lastSelectedEdge.drawOverlay(Canvas.ctx);
  }

  console.log('endEdgeDrawing');
}

export { graph, setAnimating, getLastSelectedNode, getLastSelectedEdge, getAnimating, generateRandomGraph, resetApplicationState, isGrphExtension, setNodeColor, mobileDevice }
