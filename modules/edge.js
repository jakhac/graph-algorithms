/**
 * Edge implementation with drawing functions for the user interface.
 *
 * Author: Kevin Katzkowski
 * Updated: 26.02.2020
 */

// the color for the edge's stroke 
var strokeColor;
updateStrokeColor();


class Edge {

  /**
   * Creates a new edge with an initial cost inbetween two nodes.
   * 
   * @param {Node} node1 the start node
   * @param {Node} node2 the target node
   * @param {int} cost the cost of the edge
   */
  constructor(node1, node2, cost) {
    this.startNode = node1;
    this.endNode = node2;
    this.cost = cost;
    this.path = undefined;
    this.hitbox = undefined;
  }

  /**
   * Prints the edge to the browser's console (for development).
   */
  print() {
    console.log("startNode " + this.startNode + ", endNode " + this.endNode + ", cost: " + this.cost + ", color: " + this.color);
  }

  /**
   * Draws the edge on specified canvas.
   *
   * @param ctx the canvas to draw the edge onto, specified by its context
   */
  draw(ctx) {
    // get start node center
    let startX = (this.startNode.x * 20 + 20),
      startY = (this.startNode.y * 20 + 20);

    // get target node center
    let targetX = (this.endNode.x * 20 + 20),
      targetY = (this.endNode.y * 20 + 20);

    // calculate vector length
    let vecLength = Math.sqrt((targetX - startX) * (targetX - startX)
      + (targetY - startY) * (targetY - startY));

    // normalize vector
    let vecX = (targetX - startX) / vecLength,
      vecY = (targetY - startY) / vecLength;

    // draw and save edge line
    ctx.beginPath();

    // disable shadow blur from dragged node
    ctx.shadowBlur = 0;

    // set line size and create new path
    ctx.lineWidth = 2;
    this.path = new Path2D();

    // move to vector starting point
    if (this.startNode.isFinish) {
      // set vector start position for start node -> radius = 23
      this.path.moveTo(Math.floor(startX + vecX * 23), Math.floor(startY + vecY * 23));
    } else if (this.startNode.isStart) {
      this.path.moveTo((startX + vecX * 21), (startY + vecY * 21));
    } else {
      // default: radius -> 19
      this.path.moveTo((startX + vecX * 19), (startY + vecY * 19));
    }

    // get border coordinates of end node
    let x = Math.floor(targetX - vecX * 19),
      y = Math.floor(targetY - vecY * 19);

    // draw arrow at correct distance from end node center
    if (this.endNode.isStart) {
      // set vector start position for start node -> radius == 21
      this.path.lineTo(Math.floor(targetX - vecX * 21), Math.floor(targetY - vecY * 21));

      // set coordinates for start node
      x = Math.floor(targetX - vecX * 21);
      y = Math.floor(targetY - vecY * 21);
    } else if (this.endNode.isFinish) {
      // set vector start position for finish node -> radius == 23
      this.path.lineTo(Math.floor(targetX - vecX * 23), Math.floor(targetY - vecY * 23));

      // set coordinates for finish node
      x = Math.floor(targetX - vecX * 23);
      y = Math.floor(targetY - vecY * 23);
    } else {
      // set vector start position for default node -> radius == 19
      this.path.lineTo(Math.floor(targetX - vecX * 19), Math.floor(targetY - vecY * 19));
    }

    // draw arrow 
    this.path.moveTo(x - 10 * vecX + (-vecY * 10), y - 10 * vecY + vecX * 10);
    this.path.lineTo(x, y);
    this.path.moveTo(x - 10 * vecX - (-vecY * 10), y - 10 * vecY - vecX * 10);
    this.path.lineTo(x, y);

    // draw edge
    ctx.strokeStyle = strokeColor;
    ctx.stroke(this.path);
    ctx.closePath();


    // create but do not draw hitbox for click detection
    ctx.beginPath();
    this.hitbox = new Path2D();

    // set vector start position -> radius == 19
    this.hitbox.moveTo(startX + vecX * 19, startY + vecY * 19);
    this.hitbox.lineTo(targetX - vecX * 19, targetY - vecY * 19);

    // hitbox size
    ctx.lineWidth = 20;
    ctx.closePath();

    // draw value of edge
    this.drawValue(ctx, vecX, vecY, vecLength);
  }

  /**
   * Draw the edge's value on specified canvas.
   *
   * @param {Context2D} ctx the canvas to draw the value onto, specified by its context
   * @param {float} vecX x component of the edge's normalized direction vector
   * @param {float} vecY y component of the edge's normalized direction vector
   * @param {float} veclength length of the edge's direction vector
   */
  drawValue(ctx, vecX, vecY, vecLength) {
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = strokeColor;
    ctx.textAlign = "center";

    // calculate x and y offset
    let offsetY = 20 * ((vecX * vecLength) / vecLength),
      offsetX = 20 * ((-vecX * vecLength) / vecLength);

    // calculate normal vector
    let normalX = -vecY,
      normalY = vecX;

    // calculate center of edge
    let edgeCenterX = (this.startNode.x * 20 + 20) + ((vecX * vecLength) / 2), edgeCenterY = (this.startNode.y * 20 + 25) + (((vecY) * vecLength) / 2);

    // draw value at correct position
    if (vecX < 0) {
      ctx.fillText(this.cost, Math.floor(edgeCenterX + normalX * 10), Math.floor(edgeCenterY + normalY * 10));
    } else {
      ctx.fillText(this.cost, Math.floor(edgeCenterX - normalX * 10), Math.floor(edgeCenterY - normalY * 10));
    }
  }

  /**
   * Draw an overlay on specified canvas to highlight the edge in the specified 
   * color.
   *
   * @param {Context2D} ctx the canvas to draw the overlay onto, specified by its context
   * @param {string} color the color value for the overlay
   */
  drawOverlay(ctx, color) {
    // get start node center
    let startX = (this.startNode.x * 20 + 20),
      startY = (this.startNode.y * 20 + 20);

    // get target node center
    let targetX = (this.endNode.x * 20 + 20),
      targetY = (this.endNode.y * 20 + 20);

    // calculate vector length
    let vecLength = Math.sqrt((targetX - startX) * (targetX - startX)
      + (targetY - startY) * (targetY - startY));

    // normalize vector
    let vecX = (targetX - startX) / vecLength,
      vecY = (targetY - startY) / vecLength;

    // draw and save edge line
    ctx.beginPath();

    // disable shadow blur from dragged node
    ctx.shadowBlur = 0;

    // set overlay line size and create new path
    ctx.lineWidth = 16;
    this.path = new Path2D();

    // set vector start position -> radius == 19
    this.path.moveTo(Math.floor(startX + vecX * 19), Math.floor(startY + vecY * 19));
    this.path.lineTo(Math.floor(targetX - vecX * 19), Math.floor(targetY - vecY * 19));

    // overlay styling
    if (color == 'green') {
      ctx.strokeStyle = 'rgba(55, 235, 52,0.3)';
    } else if (color == 'red') {
      ctx.strokeStyle = 'rgba(255,51,0,0.3)';
    } else {
      ctx.strokeStyle = 'rgba(34,167,240,0.3)';
    }

    // draw edge
    ctx.stroke(this.path);
    ctx.closePath();
  }

  /**
   * Change the edge's value (cost) to a new value verified through pattern 
   * matching.
   *
   * @param {int} cost the edge's new cost
   * @return {bool} true, when the new value is valid, otherwise false
   */
  changeCost(cost) {
    // valid: a 1-3 digit non-floating number
    if (cost.trim().length == 0 || !cost.trim().match(/^(\d)?(\d)?(\d)$/g)) {
      // input not valid
      return false;
    } else {
      // valid: A ... Z, a .. z, 0 ... 9, ', *, "
      this.cost = cost;

      // cost changed
      return true;
    }
  }
}

/**
 * Updates the strokeColor when the color theme is being changed.
 */
function updateStrokeColor() {
  let theme = document.documentElement.getAttribute('data-theme');
  if (theme == 'dark') {
    strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-stroke-dark-theme');
  } else {
    strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-stroke-light-theme');
  }
}

export { Edge, updateStrokeColor }
