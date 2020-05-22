
/**
 * Node implementation with drawing functions for the user interface.
 *
 * Author: Kevin Katzkowski
 * Updated: 26.02.2020
 */

// stroke color for start and target node marking
var strokeColor;

// color for node index
const indexColor = getComputedStyle(document.body).getPropertyValue('--color-node-index');

// initialize stroke color
updateStrokeColor();


class Node {

  /**
   * Creates a new node with an initial value, grid x and y coordinates 
   * and a color.
   * 
   * @param {string} value the node's value
   * @param {int} xPos the node's x grid coordinate  
   * @param {int} yPos the node's y grid coordinate  
   * @param {string} color the color code for the node's background
   */
  constructor(value, xPos, yPos, color) {
    this.value = value;
    this.x = xPos;
    this.y = yPos;
    this.color = color;
    this.dragging = false;
    this.selected = false;
    this.isStart = false;
    this.isFinish = false;
  }

  /**
   * Print the node to the browser's console (for development).
   */
  print() {
    console.log("node " + this.value + ", x: " + this.x + ", y: " + this.y + ", color: " + this.color + ', dragging: ' + this.dragging + ', selected: ' + this.selected);
  }

  /**
   * Draws the node on specified canvas.
   *
   * @param {Context2D} ctx the canvas to draw the node onto, specified by its context
   */
  draw(ctx) {
    let radius = 19; //gridSize - 1 because of border

    ctx.beginPath();

    // highlight currently dragged node
    if (this.dragging) {
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 35;
    } else {
      ctx.shadowBlur = 0;
    }

    // +20 for correct offset -> arc(x,y,...) specify center; +0.5 for grid line
    ctx.arc(this.x * 20 + 20.5, this.y * 20 + 20.5, radius, 0, 2 * Math.PI, false);

    // set node color
    ctx.fillStyle = this.color;
    ctx.fill();

    // set border width and color
    ctx.lineWidth = 2;
    ctx.strokeStyle = this.color;//strokeColor;

    ctx.stroke();
    ctx.closePath();

    // draw start or finish node highlighting
    if (this.isStart) {
      // node is start node
      ctx.beginPath();

      // +20 for correct offset -> arc(x,y,...) specify center; +0.5 for grid line
      ctx.arc(this.x * 20 + 20.5, this.y * 20 + 20.5, radius + 2, 0, 2 * Math.PI, false);

      // set line width and color
      ctx.lineWidth = 3;
      ctx.strokeStyle = strokeColor;

      ctx.stroke();
      ctx.closePath();
    } else if (this.isFinish) {
      // node is finish node
      ctx.beginPath();

      // +20 for correct offset -> arc(x,y,...) specify center; +0.5 for grid line
      ctx.arc(this.x * 20 + 20.5, this.y * 20 + 20.5, radius + 4, 0, 2 * Math.PI, false);

      // set line width and color
      ctx.lineWidth = 2;
      ctx.strokeStyle = strokeColor;

      ctx.stroke();
      ctx.closePath();
    }

    // draw node index
    this.drawIndex(ctx);
  }

  /**
   * Draws the node index on specified canvas.
   *
   * @param {Context2D} ctx the canvas to draw the index onto, specified by its context
   */
  drawIndex(ctx) {
    ctx.font = "20px Arial";
    ctx.fillStyle = indexColor;
    ctx.textAlign = "center";

    // offset from bottom left char corner
    ctx.fillText(this.value, (this.x * 20) + 20, (this.y * 20) + 26.5);
  }

  /**
   * Draws the node overlay used for highlighting.
   *
   * @param {Context2D} ctx the canvas to draw the overlay onto, specified by its context
   * @param {string} color the color value for the overlay
   */
  drawOverlay(ctx, color) {
    ctx.beginPath();

    // draw shadow
    if (color == 'red') {
      ctx.shadowColor = 'rgba(255,51,0,0.3)';

      // set node color
      ctx.fillStyle = 'rgba(255,51,0,0.3)';

      // set border color
      ctx.strokeStyle = 'rgba(255,51,0,0.3)';
    } else if (color == 'green') {
      ctx.shadowColor = 'rgba(55,235,52,0.6)';

      // set node color
      ctx.fillStyle = 'rgba(55,235,52,0.3)';

      // set border color
      ctx.strokeStyle = 'rgba(55,235,52,0.3)';
    } else {
      ctx.shadowColor = 'rgba(34,167,240,0.6)';

      // set node color
      ctx.fillStyle = 'rgba(34,167,240,0.3)';

      // set border color
      ctx.strokeStyle = 'rgba(34,167,240,0.3)';
    }
    ctx.shadowBlur = 10; // consider disabling for better performance
    let radius = 22;

    // +20 for correct offset -> arc(x,y,...) specify center; +0.5 for grid line
    ctx.arc(this.x * 20 + 20.5, this.y * 20 + 20.5, radius, 0, 2 * Math.PI, false);

    // set border width 
    ctx.lineWidth = 2;

    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  /**
   * Draws an edge draft from this node to the mouse position.
   *
   * @param {Context2D} ctx the canvas to draw the draft onto, specified by its context
   * @param {int} x x-component of the mouse position in pixels
   * @param {int} y y-component of the mouse position in pixels
   */
  drawEdgefrom(ctx, x, y) {
    // get node center
    let centerX = this.x * 20 + 20,
      centerY = this.y * 20 + 20;

    // calculate vector length
    let vecLength = Math.sqrt((x - centerX) * (x - centerX) + (y - centerY) * (y - centerY));

    // normalize vector
    let vecX = (x - centerX) / vecLength,
      vecY = (y - centerY) / vecLength;

    ctx.beginPath();

    // set vector start position -> radius == 19
    ctx.moveTo(centerX + vecX * 19, centerY + vecY * 19);
    ctx.lineTo(x, y);

    // draw arrow
    ctx.moveTo(x - 10 * vecX + (-vecY * 10), y - 10 * vecY + vecX * 10);
    ctx.lineTo(x, y);
    ctx.moveTo(x - 10 * vecX - (-vecY * 10), y - 10 * vecY - vecX * 10);
    ctx.lineTo(x, y);

    ctx.stroke();
    ctx.closePath();
  }

  /**
   * Change the node's value (index). This method is necessary, because the new * value has to be verified through pattern matching.
   *
   * @param {string} value the node's new value
   * @return {bool} true, when the node value has been changed, otherwise false
   */
  changeValue(value) {
    // valid: A ... Z, a .. z, A' ... Z', a' .. z', A'' ... Z'', a'' .. z''
    if (value.trim().length == 0 || !value.trim().match(/^[a-zA-Z][']{0,2}$/)) {
      // input not valid
      return false;
    } else {
      // input valid
      this.value = value;
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

export { Node, updateStrokeColor }
