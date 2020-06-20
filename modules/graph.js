/**
 * Graph representation for graph algorithm visualizer tool
 *
 * Authors: Jakob Hackstein, Kevin Katzkowski
 * Updated: 14.02.2020
 */

import {
  Node
} from './node.js';
import {
  storeNodeAt
} from './canvas.js';
import {
  Edge
} from './edge.js';

// import algorithms
import {
  astar
} from '../pathfinding/astar.js'
import {
  dfs,
} from '../pathfinding/dfs.js'
import {
  bfs
} from '../pathfinding/bfs.js'
import {
  dijkstra
} from '../pathfinding/dijkstra.js'
import {
  greedy
} from '../pathfinding/greedy.js'
import {
  smart_greedy
} from '../pathfinding/smart_greedy.js'


// hash ascii chars to boolean array to quick check for valid values
let baseValues = [];

// store last graph type to prevent two circleGraph back to back
let lastGraphType;

/**
 * Data structure for graph initialization and functional tasks. 
 * Converts between object literals and node/edge lists. Algorithms are called here.
 */
class Graph {

  constructor() {
    this.nodeList = [];
    this.edgeList = [];
    this.graph_algo = {};
    this.currentStartNode;
    this.currentEndNode;
    this.screenSizeX;
    this.screenSizeY;
    this.graphSize;
    this.isDistanced = false;
  }

  /**
   * Draw the graph on specified canvas by drawing all nodes and edges.
   *
   * @param ctx The canvas to draw the graph onto, specified by its context.
   */
  draw(ctx) {
    if (this.isDistanced) {
      this.distanceGraph();
    }
    // draw all nodes and store them in grid array
    this.nodeList.forEach(node => {
      node.draw(ctx);
      storeNodeAt(node, node.x, node.y);
    });

    // draw all edges
    this.edgeList.forEach(edge => {
      edge.draw(ctx);
    });


  }

  /**
   * Adds a node to current graph. Validation checks in app.js.
   * @param {Node} node Node to add to data
   */
  addNode(node) {
    this.nodeList.push(node);
  }

  /**
   * Delete node from nodeList and all edges connected with the node.
   * @param {Node} node to delete
   */
  deleteNode(node) {

    // delete node value from baseValue array
    this.updateBaseValues(node.value, undefined);

    // delete all edges containing deleted node
    for (let index = this.edgeList.length - 1; index >= 0; index--) {
      if (this.edgeList[index].startNode.value === node.value ||
        this.edgeList[index].endNode.value === node.value) {
        this.edgeList.splice(index, 1);
      }
    }

    // delete node from nodeList
    for (let index = 0; index < this.nodeList.length; index++) {
      if (node === this.nodeList[index]) {
        this.nodeList.splice(index, 1);
      }
    }
  }

  /**
   * Adds an edge between to node objects. Function will overwrite previous
   * edges between node1 and node2.
   * @param {Edge} edge edge to add to data
   */
  addEdge(edge) {
    this.edgeList.push(edge);
  }

  /**
   * delete edge from edgeList
   * @param {Edge} object to delete
   */
  deleteEdge(edge) {
    // delete all edges containing deleted node
    for (let index = 0; index < this.edgeList.length; index++) {
      if (this.edgeList[index] === edge) {
        this.edgeList.splice(index, 1);
        break;
      }
    }
  }

  /**
   * Returns true if node value is already defined in graph.
   * @param {Node} node node to check
   */
  nodeInGraph(node) {
    for (let index = 0; index < this.nodeList.length; index++) {
      if (this.nodeList[index].value === node.value) {
        return true;
      }
    }
    return false;
  }

  /**
   * Getter for the next character in alphabetical order. Modifies baseValues array.
   * 
   * @returns {string} next possible character or false, if 156 nodes are drawn
   */
  getNextBaseValue() {

    if (this.nodeList.length >= 156) {
      console.log('maximum number of nodes reached');
      return false;
    }

    let index = 65;
    let addition = 0;
    let lowerCase = 0;

    for (let i = 0; i < 2; i++) {
      if (i == 1) {
        addition = 78;
        lowerCase = 46
      }

      for (let j = index; j < 221; j++) {
        // [A-Z] + [a-z]
        if (!baseValues[j] && j <= (index + 25 + addition)) {
          baseValues[j] = String.fromCharCode(j - lowerCase);
          return baseValues[j];
        }
        // [A'-Z'] + [a'-z']
        if (!baseValues[j] && j > (index + 25 + addition) && j <= (index + 51 + addition)) {
          baseValues[j] = String.fromCharCode(j - 26 - lowerCase) + "'";
          return baseValues[j];
        }
        //[A''-Z''] + [a''-z'']
        if (!baseValues[j] && j > (index + 51 + addition) && j <= (index + 77 + addition)) {
          baseValues[j] = String.fromCharCode(j - 52 - lowerCase) + "''";
          return baseValues[j];
        }
      }
    }

    return false;
  }

  /**
   * Frees previous value1 in baseValues array and locks index of value2.
   * If value2 is undefined, only value1 will be removed in baseValues.
   * 
   * @param {char} value1 
   * @param {char} value2 
   */
  updateBaseValues(value1, value2) {

    let index;

    // free value1 baseValue slot
    index = baseValues.indexOf(value1);
    baseValues[index] = false;

    if (!value2) {
      return;
    }

    // lock slot of value2 in baseValues
    if (value2.charCodeAt(0) < 91) {
      index = value2.charCodeAt(0) + (26 * (value2.length - 1));
    } else {
      index = value2.charCodeAt(0) + 46 + (26 * (value2.length - 1));
    }
    baseValues[index] = value2;
  }

  /**
   * Returns true if two nodes are connected.
   * @param node1
   * @param node2
   */
  isConnected(node1, node2) {
    for (let index = 0; index < this.edgeList.length; index++) {
      if ((this.edgeList[index].startNode === node1 &&
        this.edgeList[index].endNode === node2) ||
        (this.edgeList[index].endNode === node1 &&
          this.edgeList[index].startNode === node2)) {
        return true;
      }

    }
    return false;
  }

  /**
   * Converts values to their data structure value, e.g. 'A-Z', 'FINISH', 'START.
   * @param {Node} node to check 
   */
  nodeToValue(node) {
    if (node.isStart) {
      return 'START'
    }
    if (node.isFinish) {
      return 'FINISH'
    }
    return node.value;
  }


  /**
   * runAlgorithm returns path in a list of chars. Empty graph does not run algorithms
   * but returns empty path.
   * @param {string} key first three chars from algorithm name
   *
   * @return {ObjectLiteral} path obj containing shortestPath, cost, nodeEdgePath, iterations
   */
  runAlgorithm(key) {

    let path = [];
    let g = this.convertToObjLit();
    console.log(`Converted graph is `, g);

    // trivial case: no edges from startnode
    if (Object.keys(g.START).length === 0) {
      let defaultReturn = {
        result: ['noPathToFinish'],
        animPath: [this.currentStartNode],
        cost: undefined
      }

      console.log(`Result for ${key} is`, defaultReturn);
      return defaultReturn;
    }

    switch (key) {
      case 'dij': // dijkstra
        path = dijkstra(g);
        break;
      case 'gre': // greedy
        path = greedy(g);
        break;
      case 'sma': // smart_greedy
        path = smart_greedy(g);
        break;
      case 'dfs': // depthFirstSearch
        path = dfs(g);
        break;
      case 'bfs': // breadthFirstSearch
        path = bfs(g)
        break;
      case 'ast': // a* star
        path = astar(g, this.nodeList, this.currentEndNode);
        break;
      default:
        return {
          animPath: [],
          result: [],
          cost: undefined,
          iterations: undefined
        };
    }

    path.result = this.convertPathToLists(path.result);
    path.animPath = this.convertPathToLists(path.animPath);
    console.log(`Result for ${key} is`, path);

    return path;
  }

  /**
   * Converts two lists for edges and nodes to object literals used by algorithms.
   * 
   * @returns {ObjectLiteral} graph as object literal
   */
  convertToObjLit() {
    // reset stored obj literal
    this.graph_algo = {};

    // copy lists to change attributes
    let nList = JSON.parse(JSON.stringify(this.nodeList));

    //add all nodes to obj lit and convert 'START' and 'FINISH'
    for (let index = 0; index < this.nodeList.length; index++) {
      if (this.nodeList[index].isStart) {
        nList[index].value = 'START';
      }

      if (this.nodeList[index].isFinish) {
        nList[index].value = 'FINISH';
      }
      // add nested obj literal to each node
      this.graph_algo[nList[index].value] = {};
    }

    //assign costs to nodes
    for (let index = 0; index < this.edgeList.length; index++) {

      // var to change start and finish values temporaly
      let startVal = this.nodeToValue(this.edgeList[index].startNode);
      let endVal = this.nodeToValue(this.edgeList[index].endNode);

      Object.assign(this.graph_algo[startVal], {
        [endVal]: parseInt(this.edgeList[index].cost)
      });
    }

    // delete possible bugged startNode
    delete this.graph_algo['START']['START']

    return this.graph_algo;
  }

  /**
   * Convert animPath returned by each algorithm to nodeEdgePath used in animation.
   * @param {string} path list of chars: the path of visited nodes in algorithm order
   *
   * @return {path} animPath with graph objects
   */
  convertPathToLists(path) {

    // trivial case: no path to finish
    if (path.length < 1) {
      return ['noPathToFinish'];
    }

    // helper variables
    let nodeEdgePath = [];
    let sortedNodeObj = {};
    let sortedEdgeObj = {};

    // overwrite 'START' and 'FINISH' to original node values
    for (let index = 0; index < path.length; index++) {
      if (path[index] === 'START') {
        path[index] = this.currentStartNode.value;
      }
      if (path[index] === 'FINISH') {
        path[index] = this.currentEndNode.value;
      }
    }

    // generate obj with value and node object to pick from
    for (let index = 0; index < this.nodeList.length; index++) {
      sortedNodeObj[this.nodeList[index].value] = this.nodeList[index];
    }

    // generate obj with value: 'startNode + endNode' and path object: 'edges between start end' to pick from
    for (let index = 0; index < this.edgeList.length; index++) {
      sortedEdgeObj[this.edgeList[index].startNode.value + this.edgeList[index].endNode.value] = this.edgeList[index];
    }

    // generate the path
    let index = 0;

    // push instrcuction and next node if instruction at index 0
    if (path[index].length > 4) {
      // push instruction and next start node
      nodeEdgePath.push(path[index]);
      index++;
      nodeEdgePath.push(sortedNodeObj[path[index]]);

    } else {
      // push start node only
      nodeEdgePath.push(sortedNodeObj[path[index]]);
    }

    // iterate over char- and instruction-path
    for (index; index < path.length - 1; index++) {

      // special case for dijkstra
      if (path[index] === 'singleDrawEdge') {
        nodeEdgePath.push('singleDraw');
        nodeEdgePath.push(sortedEdgeObj[path[index - 1] + path[index + 1]]);
        nodeEdgePath.push(sortedNodeObj[path[index + 1]])
        continue;
      }

      // if edge is defined, add edge and edge-endnode
      if (sortedEdgeObj[path[index] + path[index + 1]]) {
        nodeEdgePath.push(sortedEdgeObj[path[index] + path[index + 1]]);
        nodeEdgePath.push(sortedNodeObj[path[index + 1]]);
      }

      // if any instruction is called
      if (path[index].length > 4) {
        nodeEdgePath.push(path[index])
      }

      // handle fullDraw
      if (path[index] === 'fullDraw') {
        nodeEdgePath.push(sortedNodeObj[path[index + 1]]);
      }

      // handle singleDraw (dfs)
      if (path[index] === 'singleDrawMid') {
        nodeEdgePath.pop();
        nodeEdgePath.push('singleDraw', sortedEdgeObj[path[index - 1] + path[index + 1]]);
        nodeEdgePath.push(sortedNodeObj[path[index + 1]]);
      }

      // skip cycles in dfs
      if (path[index] === 'removeLastNode') {
        nodeEdgePath.splice(-2, 2);
      }
    }

    // remove last node to prevent double highlighting in cycles (both greedy)
    if (path.includes('cycle')) {
      nodeEdgePath.pop();
    }

    return nodeEdgePath;
  }

  /**
   * Converts graph in string.
   * 
   * @returns {string} graph as string
   */
  convertToString() {
    let file = "";

    file += "Nodes ";
    for (let index = 0; index < this.nodeList.length; index++) {
      let colorAttribute = this.nodeList[index].color;
      file += this.nodeList[index].value + " " + this.nodeList[index].x + " " + this.nodeList[index].y + " " + colorAttribute.trim() + " ";
    }

    if (this.currentStartNode) {
      file += "StartNode " + this.currentStartNode.value + " ";
    } else {
      file += "StartNode " + 'undefined' + " ";
    }

    if (this.currentEndNode) {
      file += "EndNode " + this.currentEndNode.value + " ";
    } else {
      file += "EndNode " + 'undefined' + " ";
    }

    file += "Edges ";

    for (let index = 0; index < this.edgeList.length; index++) {
      file += this.edgeList[index].startNode.value + " " + this.edgeList[index].endNode.value + " " + this.edgeList[index].cost + " " + this.edgeList[index].color + " ";
    }

    return file;
  }

  /**
   * Generate XL graph or circle graph. If previous graph was circle or the current graph
   * is distacned, XL graph is generated by default.
   * 
   * @param {string} nodeColor
   * @returns {string} a string of the new generated graph
   */
  randomGraph(nodeColor) {

    // this.randomGraphXL(nodeColor);
    // return this.convertToString();

    if (lastGraphType === 'Circle' || this.isDistanced) {
      this.randomGraphXL(nodeColor);
      lastGraphType = 'XL';
    } else if (this.getRandomBool(0.5)) {
      this.randomGraphXL(nodeColor);
      lastGraphType = 'XL';
    } else {
      this.randomGraphCircle(nodeColor);
      lastGraphType = 'Circle';
    }

    return this.convertToString();
  }

  randomGraphXL(nodeColor) {

    this.resetGraph();

    let x = 5;
    let y = 5;
    let maxX = this.screenSizeX - 20; // 20 -> sidebar length + puffer
    let maxY = this.screenSizeY - y; // 5 -> start value, too
    let colDistance = Math.floor(maxY / 5); // 5 nodes per row
    let rowDistance = 14; // solid distance between rows
    let adjList = [];
    let minNodes;
    let counter = 0;
    let probability = 0.0;
    let edgeProbability = 0.0;

    switch (this.graphSize) {
      case 's':
        maxX -= 10;
        maxY -= 10;
        colDistance = Math.floor(maxY / 4);
        rowDistance = 16;
        minNodes = 9;
        probability = 0.1
        edgeProbability = 0.2;
        break;
      case 'm':
        maxX = this.screenSizeX - 21;
        maxY = this.screenSizeY - y;
        colDistance = Math.floor(maxY / 5);
        minNodes = 12;
        edgeProbability = 0.1;
        break;
      case 'l':
        maxX = this.screenSizeX + 10;
        maxY = this.screenSizeY + 20;
        colDistance = Math.floor(maxY / 5);
        minNodes = 20;
        probability = 0.2
        break;
    }

    // while coordinates in box and minimum nodes are drawn
    while (x < maxX || this.nodeList.length < minNodes) {

      // store 
      let subList = [];

      while (y < maxY) {

        y += (Math.round(Math.random()) * 2 - 1)

        if (this.getRandomBool(0.3 - probability)) {
          this.nodeList.push(new Node(this.getNextBaseValue(), x + (Math.round(Math.random()) * 2 - 1), y, nodeColor));
          subList.push(counter);
          counter++;
        }

        // increment y value with colDistance
        y += colDistance;

      }

      // prevent no nodes drawn in a row
      if (subList.length === 0) {
        this.nodeList.push(new Node(this.getNextBaseValue(), x + (Math.round(Math.random()) * 2 - 1), (y - colDistance), nodeColor));
        subList.push(counter);
        counter++;
      }

      // increment x value with colsDistance
      adjList.push(subList);
      x += rowDistance;
      y = 5;
    }

    // generate random edges
    for (let i = 0; i < adjList.length; i++) {

      for (let j = 0; j < adjList[i].length - 1; j++) {

        // vertical paths
        if ([adjList[i][j]] && [adjList[i][j + 1]]) {
          this.edgeList.push(new Edge(this.nodeList[adjList[i][j]], this.nodeList[adjList[i][j + 1]], this.getRandomCost()));
        }

        // pairwise horizontal paths
        if (this.getRandomBool(0.4) && i < adjList.length - 1 && this.nodeList[adjList[i][j]] && this.nodeList[adjList[i + 1][j]]) {
          this.edgeList.push(new Edge(this.nodeList[adjList[i][j]], this.nodeList[adjList[i + 1][j]], this.getRandomCost()));
        }

        // pairwise horizontal paths
        if (this.getRandomBool(0.4 + edgeProbability) && i < adjList.length - 1 && j < adjList[i + 1].length && this.nodeList[adjList[i][j]] && this.nodeList[adjList[i + 1][j + 1]]) {
          this.edgeList.push(new Edge(this.nodeList[adjList[i][j]], this.nodeList[adjList[i + 1][j + 1]], this.getRandomCost()));
        }

      }

      // top edges
      if (i < adjList.length - 1 && !this.isConnected(this.nodeList[adjList[i][0]], this.nodeList[adjList[i + 1][0]])) {
        let n1 = this.nodeList[adjList[i][0]];
        let n2 = this.nodeList[adjList[i + 1][0]]

        if (n1 && n2) {
          this.edgeList.push(new Edge(n1, n2, this.getRandomCost()));
        }
      }

      // bottom edges
      if (i < adjList.length - 1 && !this.isConnected(this.nodeList[adjList[i][adjList[i].length - 1]], this.nodeList[adjList[i + 1][adjList[i + 1].length - 1]])) {
        let n1 = this.nodeList[adjList[i][adjList[i].length - 1]]
        let n2 = this.nodeList[adjList[i + 1][adjList[i + 1].length - 1]]

        if (n1 && n2) {
          this.edgeList.push(new Edge(n1, n2, this.getRandomCost()));
        }
      }
    }

    // set startNode and endNode in graph
    this.nodeList[0].isStart = true;
    this.currentStartNode = this.nodeList[0];
    this.nodeList[this.nodeList.length - 1].isFinish = true;
    this.currentEndNode = this.nodeList[this.nodeList.length - 1];

    // console.table(adjList);

    return true;
  }

  /**
   * Generate random graph on full screen.
   */
  randomGraphXLL(nodeColor) {

    this.resetGraph();

    let amount, probability;
    let x = 5;
    let y = 5;
    let direction = true; //this.getRandomBool(0.6)
    let drawnNodes_0 = 0;
    let drawnNodes_1 = 0;
    let drawnNodes_2 = 0;
    let sNodes = 0;

    // change size parameters
    switch (this.graphSize) {
      case 's':
        amount = this.screenSizeX - 55;
        probability = 0.2;
        direction = true;
        sNodes = 0.2
        break;
      case 'l':
        amount = this.screenSizeX - 5;
        probability = 0;
        break;
      default: // m
        amount = this.screenSizeX - 30;
        probability = 0.1;
        break;
    }

    for (let index = 0; index < (amount / 6); index++) {

      y = direction ? (8 + Math.floor(Math.random() * 2)) : (this.screenSizeY - 4 + Math.floor(Math.random() * 2));

      for (let j = 0; j < 4; j++) {

        // draw NODES
        if (this.getRandomBool(0.3 + sNodes)) {
          if (this.graphSize === 's') {
            // change x y for vertical graph
            this.nodeList.push(new Node(this.getNextBaseValue(), x + Math.floor(Math.random() * (j)), y, nodeColor));
          } else {
            this.nodeList.push(new Node(this.getNextBaseValue(), x + Math.floor(Math.random() * (j)), y, nodeColor));
          }

          drawnNodes_0++;

          // draw path edges
          let edgeStart = this.nodeList[this.nodeList.length - 2]
          let edgeEnd = this.nodeList[this.nodeList.length - 1]
          if (edgeStart && edgeEnd) {
            this.edgeList.push(new Edge(edgeStart, edgeEnd, this.getRandomCost(), 'black'));
          }
        }

        y = direction ? (y += 6) : (y -= 6);
      }

      // temp store possible nodes to quicker check valid edges
      let tempStart;
      let tempEnd;

      if (this.graphSize === 's') {
        tempStart = this.nodeList[this.nodeList.length - drawnNodes_0 + 1];
        tempEnd = this.nodeList[this.nodeList.length - 2];
        if (tempStart && tempEnd && !this.isConnected(tempStart, tempEnd)) {
          this.edgeList.push(new Edge(tempStart, tempEnd, this.getRandomCost(), 'black'));
        }

        tempStart = this.nodeList[this.nodeList.length - drawnNodes_0 + 3];
        tempEnd = this.nodeList[this.nodeList.length - 1];
        if (tempStart && tempEnd && !this.isConnected(tempStart, tempEnd)) {
          this.edgeList.push(new Edge(tempStart, tempEnd, this.getRandomCost(), 'black'));
        }
      }

      // draw middle horizontal edges, disable in smaller graphs
      tempStart = this.nodeList[this.nodeList.length - drawnNodes_0 - 1];
      tempEnd = this.nodeList[this.nodeList.length - 1];
      if (tempStart && tempEnd && index > 0 && this.getRandomBool(0.2 + (2 * probability)) && !this.isConnected(tempStart, tempEnd)) {
        this.edgeList.push(new Edge(tempStart, tempEnd, this.getNodeDistance(tempStart, tempEnd), 'black'));
      }

      // draw extra down edges
      tempStart = this.nodeList[this.nodeList.length - drawnNodes_0 - 2];
      if (tempStart && tempEnd && index > 0 && direction && this.getRandomBool(0.5 - sNodes) && !this.isConnected(tempStart, tempEnd)) {
        this.edgeList.push(new Edge(tempStart, tempEnd, this.getNodeDistance(tempStart, tempEnd), 'black'));
      }

      // draw top & bottom edges
      tempStart = this.nodeList[this.nodeList.length - drawnNodes_0 - drawnNodes_2 - drawnNodes_1];
      tempEnd = this.nodeList[this.nodeList.length - drawnNodes_0];
      if (index > 1 && tempStart && tempEnd && this.getRandomBool(0.45 - probability) && !this.isConnected(tempStart, tempEnd)) {
        this.edgeList.push(new Edge(tempStart, tempEnd, this.getNodeDistance(tempStart, tempEnd), 'black'));
      }

      // increment x, reset y, change direction for planar graph
      x += 6;
      drawnNodes_2 = drawnNodes_1;
      drawnNodes_1 = drawnNodes_0;
      drawnNodes_0 = 0;
      direction = !direction;
    }

    // set startNode and endNode in graph
    this.nodeList[0].isStart = true;
    this.currentStartNode = this.nodeList[0];
    this.nodeList[this.nodeList.length - 1].isFinish = true;
    this.currentEndNode = this.nodeList[this.nodeList.length - 1];

    return true;
  }

  /**
 * Generate random circle graph on full screen.
 */
  randomGraphCircle(nodeColor) {

    this.resetGraph();

    let x = Math.floor(this.screenSizeX / 2) - Math.floor(this.screenSizeX / 15);
    let y = Math.floor(this.screenSizeY / 2);
    let coordinateList = [];
    let b = 0;
    let degree, length, circle;

    // change size parameters
    switch (this.graphSize) {
      case 's':
        length = y - 4;
        circle = 1;
        break;
      case 'l':
        circle = 2;
        length = y - 2;
        break;
      default: // m
        circle = 2;
        length = y - 4;
        break;
    }

    // add start node
    if (this.screenSizeX < 45) {
      this.nodeList.push(new Node("Z''", 2, y, nodeColor));
    } else {
      this.nodeList.push(new Node(this.getNextBaseValue(), 2, y, nodeColor));
    }

    for (let circles = circle; circles > 0; circles--) {

      degree = 90;
      for (let index = 0; index < 4; index++) {
        b = Math.floor(Math.tan(degree * Math.PI / 180) * length);
        coordinateList.push(this.getVectorLength(x, y, x - b, y + length, length));
        degree -= 30;
      }

      b = Math.floor(Math.tan(30 * Math.PI / 180) * length);
      coordinateList.push(this.getVectorLength(x, y, x + b, y + length, length));
      b = Math.floor(Math.tan(60 * Math.PI / 180) * length);
      coordinateList.push(this.getVectorLength(x, y, x + b, y + length, length));

      degree = 90;
      for (let index = 0; index < 4; index++) {
        b = Math.floor(Math.tan(degree * Math.PI / 180) * length);
        coordinateList.push(this.getVectorLength(x, y, x + b, y - length, length));
        degree -= 30;
      }

      b = Math.floor(Math.tan(30 * Math.PI / 180) * length);
      coordinateList.push(this.getVectorLength(x, y, x - b, y - length, length));
      b = Math.floor(Math.tan(60 * Math.PI / 180) * length);
      coordinateList.push(this.getVectorLength(x, y, x - b, y - length, length));

      // adjust length for inner circle
      length = Math.floor(length / 1.5);
    }

    coordinateList.push({ x: x - length, y: y });
    coordinateList.push({ x: x, y: y + length });
    coordinateList.push({ x: x + length, y: y });
    coordinateList.push({ x: x, y: y - length });

    // generate all nodes from coordinatesList
    for (let j = 0; j < coordinateList.length; j++) {
      this.nodeList.push(new Node(this.getNextBaseValue(), coordinateList[j].x, coordinateList[j].y, nodeColor));
    }

    // add endNode in center of canvas
    this.nodeList.push(new Node(this.getNextBaseValue(), x, y, nodeColor));

    // add edges
    for (let index = 0; index < this.nodeList.length - 1; index++) {

      if (index > 7 && index < 13) {
        this.edgeList.push(new Edge(this.nodeList[index], this.nodeList[index - 1], this.getRandomCost(), 'black'));
      } else {
        // double check for valid edges
        this.edgeList.push(new Edge(this.nodeList[index], this.nodeList[index + 1], this.getRandomCost(), 'black'));
      }

      // combine inner and outer circle
      if (index > 0 && index <= 12 && circle > 1) {
        this.edgeList.push(new Edge(this.nodeList[index], this.nodeList[index + 12], this.getRandomCost(), 'black'));
      }

    }

    // remove double edge end of circle
    if (circle == 2) {
      this.edgeList.splice(13, 1);
    } else {
      this.edgeList.splice(7, 1);
    }

    //combine circles
    if (circle > 1) {
      let innerCount = 13;
      for (let index = 0; index < 4; index++) {
        this.edgeList.push(new Edge(this.nodeList[innerCount], this.nodeList[index + 25], this.getRandomCost(), 'black'));
        innerCount += 3;
      }
    } else {
      let innerCount = 13;
      for (let index = 1; index < 13; index++) {
        this.edgeList.push(new Edge(this.nodeList[index], this.nodeList[innerCount], this.getRandomCost(), 'black'));

        innerCount = (index === 3) ? innerCount += 1 : innerCount;
        innerCount = (index === 6) ? innerCount += 1 : innerCount;
        innerCount = (index === 9) ? innerCount += 1 : innerCount;
      }
      this.edgeList.push(new Edge(this.nodeList[14], this.nodeList[this.nodeList.length - 1], this.getRandomCost(), 'black'));
    }

    // different direction edge
    if (circle > 1) {
      this.edgeList.push(new Edge(this.nodeList[1], this.nodeList[12], this.getRandomCost(), 'black'));
      this.edgeList.push(new Edge(this.nodeList[25], this.nodeList[28], this.getRandomCost(), 'black'));
    } else {
      this.edgeList.push(new Edge(this.nodeList[1], this.nodeList[12], this.getRandomCost(), 'black'));
      this.edgeList.push(new Edge(this.nodeList[13], this.nodeList[16], this.getRandomCost(), 'black'));
    }

    // add startNode and endNode to graph data
    if (this.screenSizeX < 45) {
      this.deleteNode(this.nodeList[0]);

      this.nodeList[0].isStart = true;
      this.currentStartNode = this.nodeList[0];
      this.nodeList[this.nodeList.length - 1].isFinish = true;
      this.currentEndNode = this.nodeList[this.nodeList.length - 1];

    } else {
      this.nodeList[0].isStart = true;
      this.currentStartNode = this.nodeList[0];
      this.nodeList[this.nodeList.length - 1].isFinish = true;
      this.currentEndNode = this.nodeList[this.nodeList.length - 1];
    }

    return true;
  }

  /**
   * Returns array of current nodes in graph.
   * 
   * @returns {NodeArray} current nodeList
   */
  getNodeList() {
    return this.nodeList;
  }

  /**
  * Return (x, y) object with scaled vector. Used for coordinates in circle graph.
  * 
  * @param {int} midX middle of screen x axis
  * @param {int} midY middle of screen y axis
  * @param {int} x point x
  * @param {int} y point y
  * @param {int} len length of returning vector
  * 
  * @returns {Object} object with x, y attributes for coordinates
  */
  getVectorLength(midX, midY, x, y, len) {

    let midToPointVec = {
      x: x - midX,
      y: y - midY
    }

    let currentLength = Math.sqrt((midToPointVec.x * midToPointVec.x) + (midToPointVec.y * midToPointVec.y));
    let scale = len / currentLength;

    midToPointVec.x *= scale;
    midToPointVec.y *= scale;

    midToPointVec.x += midX;
    midToPointVec.y += midY;

    return {
      x: Math.floor(midToPointVec.x),
      y: Math.floor(midToPointVec.y)
    };
  }

  /**
   * Returns random bool value. Higher value is a higher chance for false value.
   * @param {float} probability changes probability for bool -> 0.5 is 50 / 50 probability
   * 
   * @returns {boolean} random boolean value
   */
  getRandomBool(probability) {
    return Math.random() >= probability;
  }

  /**
   * Returns random int value inbetween [1..20]
   * 
   * @returns {int} random value [1..20]
   */
  getRandomCost() {
    return 1 + Math.floor(Math.random() * 20);
  }

  /**
   * Calculate distance between two given nodes.
   * 
   * @param {node} node1 first node
   * @param {node} node2 second node
   * 
   * @returns {int} distance between nodes
   */
  getNodeDistance(node1, node2) {
    if (node1 && node2) {
      return Math.floor(Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2))) - 2;
    }
  }

  /**
   * Refresh all costs to real distance in edge list.
   */
  distanceGraph() {
    for (let j = 0; j < this.edgeList.length; j++) {
      this.edgeList[j].cost = this.getNodeDistance(this.edgeList[j].startNode, this.edgeList[j].endNode);
    }
  }

  /**
   * Delete all entries from graph.
   */
  resetGraph() {
    this.nodeList = [];
    this.edgeList = [];
    this.graph_algo = {};
    this.currentStartNode = undefined;
    this.currentEndNode = undefined;
    baseValues = [];
  }

  /**
   * Print current graph in console.
   */
  printGraph() {
    console.log("Graph: ");
    console.log('nodeList ', this.nodeList);
    console.log('edgeList ', this.edgeList);
    console.log('graph_algo ', this.graph_algo);
    console.log('Current startNode is ', this.currentStartNode);
    console.log('Current endNode is ', this.currentEndNode);
  }

  /**
   * Exports graph as a string in a new .grph file. User can rename file.
   * 
   * @param {string} name for save as dialog
   */
  exportGraph(name) {

    let graphtext = this.convertToString();

    var blob = new Blob([graphtext], {
      type: 'text/csv'
    });
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, name + '.grph'); // IE10
    } else {
      var elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = name + '.grph';
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  /**
   * Import graph to data structure. 
   * 
   * @param {string} file .grph file containting graph as text
   */
  importGraph(graphtext) {

    this.resetGraph();

    let txt = graphtext;
    let nodeObj = {};
    let counter = 1;
    txt = txt.toString().split(" ");
    txt.pop();

    while (txt[counter] !== ('StartNode')) {
      let node = new Node(txt[counter], parseInt(txt[counter + 1]), parseInt(txt[counter + 2]), txt[counter + 3]);
      nodeObj[txt[counter]] = node;
      this.nodeList.push(node);
      counter += 4;
    }

    counter++;

    if (nodeObj[txt[counter]]) {
      nodeObj[txt[counter]].isStart = true;
      this.currentStartNode = nodeObj[txt[counter]];
    }
    counter += 2;
    if (nodeObj[txt[counter]]) {
      nodeObj[txt[counter]].isFinish = true;
      this.currentEndNode = nodeObj[txt[counter]];
    }
    counter += 2;

    console.log(txt);

    while (txt[counter] && nodeObj[txt[counter]]) {
      let edge = new Edge(nodeObj[txt[counter]], nodeObj[txt[counter + 1]], parseInt(txt[counter + 2]), 'black');
      this.edgeList.push(edge);
      counter += 4;
    }

    this.printGraph()

    // update baseValues array for used chars
    for (let j = 0; j < this.nodeList.length; j++) {
      this.updateBaseValues(this.nodeList[j].value, this.nodeList[j].value)
    }
  }

}

export {
  Graph
};
