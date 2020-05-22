/**
 * Canvas implementation for user interface interaction.
 * This file contains basic canvas functions.
 *
 * Author: Kevin Katzkowski
 * Updated: 23.02.2020
 */

import { Graph } from './graph.js';
import * as Minimap from './minimap.js';
import { updateStrokeColor as updateStrokeColorEdge } from './edge.js';
import { updateStrokeColor as updateStrokeColorNode } from './node.js';

// store graph object
const graph = new Graph();

// main canvas used for interaction and overlay drawing
const canvas = document.getElementById('canvas'),
  ctx = canvas.getContext('2d');

// canvas used for graph drawing  
const graphCanvas = document.getElementById('canvas-graph'),
  graphCtx = graphCanvas.getContext('2d');

// background canvas for background grid
const bgCanvas = document.getElementById('canvas-bg'),
  bgCtx = bgCanvas.getContext('2d');

// data array to store node location
var gridData;

// scale background canvas
bgCanvas.width = 2600;
bgCanvas.height = 1400;

// scale graph canvas
graphCanvas.width = bgCanvas.width;
graphCanvas.height = bgCanvas.height;

// scale main canvas
canvas.width = bgCanvas.width;
canvas.height = bgCanvas.height;

/**
 * Sets up the data array to store the position of objects on the drawn grid.
 * 
 * @param {int} row amount of grid rows 
 * @param {int} col amount of grid columns
 */
function initGridDataArray(row, col) {
  gridData = new Array(row);
  for (var r = 0; r < (row); ++r) {
    gridData[r] = new Array(col);
    for (var c = 0; c < col; ++c) {
      gridData[r][c] = undefined; // default cell value
    }
  }

  graph.screenSizeX = Math.floor((window.innerWidth - 261 / 20) / 20);
  graph.screenSizeY = Math.floor(window.innerHeight / 20);
}

/**
 * Draws a grid onto the background canvas.
 */
function drawGrid() {
  // cube size
  let s = 20;
  // paddings
  let pL = 0.5;
  let pT = 0.5;
  let pR = 0.5;
  let pB = 0.5;

  bgCtx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-grid');
  bgCtx.beginPath();

  // iterate over screen width and draw vertical lines
  for (var x = pL; x <= bgCanvas.width - pR; x += s) {
    bgCtx.moveTo(x, pT);
    bgCtx.lineTo(x, bgCanvas.height - pB);
  }

  // iterate over screen height and draw horizontal lines
  for (var y = pT; y <= bgCanvas.height - pB; y += s) {
    bgCtx.moveTo(pL, y);
    bgCtx.lineTo(bgCanvas.width - pR, y);
  }
  bgCtx.stroke();

  // init minimap, indicator and grid data array
  Minimap.drawMiniMap();
  Minimap.setIndicator(window.scrollX, window.scrollY);
  initGridDataArray(Math.floor(bgCanvas.width / s), Math.floor(bgCanvas.height / s));
}

/**
 * Refreshes the main canvas by clearing the data array for grid and redrawing
 * the graph. Element overlays will be removed.
 */
function update() {
  // clear canvas by reassigning values
  canvas.width = 2600;
  canvas.height = 1400;

  graphCanvas.width = canvas.width;
  graphCanvas.height = canvas.height;

  // reset grid data array
  initGridDataArray(Math.floor(bgCanvas.width / 20), Math.floor(bgCanvas.height / 20));

  redrawGraph();
  Minimap.drawMiniMap();
  console.log('redrawn');
  console.trace();
  
}

/**
 * Redraws the graph onto the main canvas.
 */
function redrawGraph() {
  updateStrokeColorEdge();
  updateStrokeColorNode();
  if (graph != undefined) graph.draw(graphCtx);
}

/**
 * Returns mouse position on canvas as pixels.
 * @param {event} evt browser event
 */
function getCanvasMousePosition(evt) {
  let rect = canvas.getBoundingClientRect();

  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  }
}

/**
 * Returns mouse position on canvas as grid coordinates.
 * @param {event} evt browser event
 */
function getCanvasPosition(evt) {
  let position = getCanvasMousePosition(evt);

  return {
    x: Math.floor(position.x / 20),
    y: Math.floor(position.y / 20)
  }
}

/**
 * Returns true when a node at the specified grid coordinates can be drawn,
 * false otherwise.
 * 
 * @param {int} x 
 * @param {int} y 
 */
function checkValidCoordinates(x, y) {
  if (gridData.length <= (x + 1) || gridData[0].length <= (y + 1)) {
    return false; // prevents index out of bounds
  } else if (gridData[x][y] == undefined && gridData[x + 1][y] == undefined &&
    gridData[x][y + 1] == undefined && gridData[x + 1][y + 1] == undefined) {
    return true;
  } else {
    return false;
  }
}

/**
 * Stores a node in the grid data array. Does not prevent exceptions!
 * 
 * @param {Node} node the node to be stored 
 */
function storeNodeAt(node) {
  let x = node.x;
  let y = node.y;

  // store node in grid array
  gridData[x][y] = node;
  gridData[x + 1][y] = node;
  gridData[x][y + 1] = node;
  gridData[x + 1][y + 1] = node;
}

/**
 * Returns the node when a node at the specified grid coordinates exists,
 * otherwise the default value (undefined). 
 * 
 * @param {int} x x grid coordinate
 * @param {int} y y grid coordinate
 */
function getNodeAtCoordinates(x, y) {
  return (x >= gridData.length || y >= gridData[0].length ? undefined : gridData[x][y]);
}

/**
 * Clears the canvas by resetting the graph and updating the canvas.
 */
function clearCanvas() {
  // reset graph 
  graph.resetGraph();

  // update main canavs
  update();
}

/**
 * Sets the canvas' left offset. 
 * 
 * @param {int} left the left offset as pixels
 */
function setCanvasPosition(left) {
  // move canvas
  canvas.style.left = left + 'px';
  graphCanvas.style.left = left + 'px';
  bgCanvas.style.left = left + 'px';
}

export { graph, canvas, graphCanvas, ctx, graphCtx, bgCtx, gridData, initGridDataArray, drawGrid, update, redrawGraph, getCanvasMousePosition, getCanvasPosition, setCanvasPosition, checkValidCoordinates, getNodeAtCoordinates, storeNodeAt, clearCanvas }