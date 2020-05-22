/**
 * Minimap implementation for faster canvas navigation.
 *
 * Author: Kevin Katzkowski
 * Updated: 26.02.2020
 */

import * as Canvas from './canvas.js';
import { getSidebarWidth } from './sidebar.js';

// mini canvas for minimap
const miniCanvas = document.getElementById('mini-canvas'),
  miniCtx = miniCanvas.getContext('2d');

// minimap indicator
const indicator = document.getElementById('indicator');

// minimap container
const minimapContainer = document.getElementById('minimap');

// true when canvas is navigated using the mouse
var navigating = false;

/**
 * Draws the minimap by copying the main canvas.
 */
function drawMiniMap() {
  // set minimap canvas size
  miniCanvas.width = Canvas.canvas.width / 10;
  miniCanvas.height = Canvas.canvas.height / 10;

  // set minimap container size
  minimapContainer.style.width = miniCanvas.width;
  minimapContainer.style.height = miniCanvas.height;

  // set indicator size
  indicator.style.width = ((window.innerWidth - getSidebarWidth()) / 10) + 'px';
  indicator.style.height = ((window.innerHeight) / 10) + 'px';

  // copy main canvas to minimap
  miniCtx.beginPath();
  miniCtx.drawImage(Canvas.graphCanvas, 0, 0, Canvas.canvas.width / 10, Canvas.canvas.height / 10);
  miniCtx.stroke();
}

/**
 * Sets the minimap indicator position.
 * @param {int} x x-position
 * @param {int} y y-position
 */
function setIndicator(x, y) {
  // if indicator is being set by scroll listener
  if (!navigating) {
    // set initial position by scroll x and y values
    indicator.style.top = miniCanvas.getBoundingClientRect().top + Math.floor(y / 10) + 'px';
    indicator.style.left = miniCanvas.getBoundingClientRect().left + Math.floor(x / 10) + 'px';
  }
  else {
    // if indicator is being set through mouse navigation
    x = Math.floor(x - (parseInt(indicator.style.width) / 2));
    y = Math.floor(y - (parseInt(indicator.style.height) / 2));

    // calculate indicator bounds -> +5 is to avoid cut-offs at screen edges
    let maxY = miniCanvas.getBoundingClientRect().top + miniCanvas.height
      - indicator.offsetHeight + 5,
      minY = miniCanvas.getBoundingClientRect().top,
      maxX = miniCanvas.getBoundingClientRect().left + miniCanvas.width
        - indicator.offsetWidth + 5,
      minX = miniCanvas.getBoundingClientRect().left;

    // if new position is within X bounds
    if (x > maxX) {
      indicator.style.left = maxX + 'px';
    } else if (x < minX) {
      indicator.style.left = minX + 'px';
    } else {
      indicator.style.left = x + 'px';
    }

    // if new position is within Y bounds
    if (y > maxY) {
      indicator.style.top = maxY + 'px';
    } else if (y < minY) {
      indicator.style.top = minY + 'px';
    } else {
      indicator.style.top = y + 'px';
    }

    // scroll window to position
    window.scrollTo(
      (parseInt(indicator.style.left) - miniCanvas.getBoundingClientRect().left) * 10,
      (parseInt(indicator.style.top) - miniCanvas.getBoundingClientRect().top) * 10
    );

    // correct indicator position to reduce overlapping
    indicator.style.top = parseInt(indicator.style.top) - 2 + 'px';
    indicator.style.left = parseInt(indicator.style.left) - 2 + 'px';
  }
}

// enable indicator navigation on mousedown event on minimap
minimapContainer.addEventListener('mousedown', evt => {
  navigating = true;
  setIndicator(evt.clientX, evt.clientY);
});

// disable indicator navigation on mouseup event on minimap
window.addEventListener('mouseup', () => {
  navigating = false;
});

// scroll the window on indicator mousemove event on minimap
minimapContainer.addEventListener('mousemove', evt => {
  if (navigating) {
    // new indicator position
    setIndicator(evt.clientX, evt.clientY);
  }
});

// set the indicator position on window scroll event
window.addEventListener('scroll', function () {
  if (!navigating) {
    setIndicator(window.scrollX, window.scrollY);
  }
});

export { drawMiniMap, setIndicator }