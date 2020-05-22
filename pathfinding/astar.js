/**
 * A* Star implementation for pathfinding algorithms.
 *
 * Author: Jakob Hackstein
 * Updated: 29.02.2020
 */


/**
 * Function returns the lowest connecting node considering the heuristic value of each node.
 * 
 * @param {IntArray} costs list of known nodes
 * @param {CharArray} processed list with all procssed nodes in path
 * @param {IntArray} estimatedCost list with heuristic distances to finish
 * 
 * @returns {char} lowest connected node 
 */
function findLowestCostNode(costs, processed, estimatedCost) {
  const knownNodes = Object.keys(costs)

  // remove finish if cost is still Infinity
  if (costs['FINISH'] === Infinity) {
    knownNodes.splice(knownNodes.indexOf('FINISH'), 1);
  }

  const lowestCostNode = knownNodes.reduce((lowest, node) => {
    // base case
    if (lowest === null && !processed.includes(node)) {
      lowest = node;
    }

    // if non-processed node is lower than stored node plus estimatedCost
    if (((costs[node] + estimatedCost[node]) < (costs[lowest] + estimatedCost[lowest])) &&
      !processed.includes(node)) {
      lowest = node;
    }
    return lowest;
  }, null); // initial value is null

  return lowestCostNode;
}


/**
 * Function runs the A* algorithm and returns obj literal
 * with shortestPath, cost and animPath.
 * 
 * @param {Object} graph given graph
 * @param {NodeArray} nodeList from current graph instance
 * @param {Node} endnode from current graph instance
 * 
 * @returns {Object} obj including result, animPath, cost, iterations
 * 
 * Animation Pattern:
 * finish reached
 *    animationPath [singleDraw, node, singleDraw, edge, node, fullDraw, 
 *                    node, edge, node, singleDraw, edge, node, .., node]
 *    result [node, edge, node, edge, .., node]
 *    cost = Integer
 * finish not reached
 *    animationPath[singleDraw, node, edge, node, edge.., edge]
 *    result [noPathToFinish]
 *    cost = undefined
 * 
 */
function astar(graph, nodeList, endNode) {

  let trackedCosts = Object.assign({}, {
    FINISH: Infinity
  }, graph.START);
  let trackedParents = {
    FINISH: null
  };
  let animPath = [];
  let lastTakenNode = undefined;
  let iterations = 0;

  // assign all estimated costs to finish to object
  let heuristics = {};
  for (let i = 0; i < nodeList.length; i++) {
    // calc hypotenuse for each node and store in obj
    let x = (nodeList[i].x - endNode.x);
    let y = (nodeList[i].y - endNode.y);

    let estimatedCost = Math.sqrt((x * x) + (y * y)) - 2;
    heuristics[nodeList[i].value] = Math.round(estimatedCost);

    // Finish is always 0
    if (nodeList[i].isFinish) {
      heuristics[nodeList[i].value] = 0;
    }
  }

  for (let child in graph.START) {
    trackedParents[child] = 'START';
  }

  let processedNodes = ['START'];
  let node = findLowestCostNode(trackedCosts, processedNodes, heuristics);
  lastTakenNode = node;

  while (node) {

    iterations++;
    let costToNode = trackedCosts[node];
    let childrenOfNode = graph[node];

    for (let child in childrenOfNode) {

      let costToChild = costToNode + childrenOfNode[child];

      // update current costs to all nodes
      if (!trackedCosts[child] || costToChild < trackedCosts[child]) {
        trackedCosts[child] = costToChild;
        trackedParents[child] = node;
      }

    }

    processedNodes.push(node);
    animPath.push(generatePathFromParents(node, trackedParents));

    // break as soon as finish is reached
    if (node === 'FINISH') {
      break;
    }

    node = findLowestCostNode(trackedCosts, processedNodes, heuristics);

    // store lastTakenNode if finish is not reached
    if (node !== 'FINISH' && node && node !== 'START') {
      lastTakenNode = node;
    }
  }

  for (let i = 0; i < animPath.length; i++) {

    // add instructions
    animPath[i].push('fullDraw');
    animPath[i].splice(animPath[i].length - 2, 0, 'singleDrawEdge');
  }
  animPath = animPath.flat();
  animPath.unshift('singleDraw');

  let optimalPath;
  let cost;

  // if finish is not reachable
  if (trackedParents['FINISH']) {
    optimalPath = generatePathFromParents('FINISH', trackedParents);
    cost = trackedCosts.FINISH;
  } else {
    optimalPath = [];
    cost = undefined;
  }

  return {
    result: optimalPath,
    animPath: animPath,
    cost: cost,
    iterations: iterations
  };
}

/**
 * Generates current path from start to node from trackedParents and given node.
 *
 * @param {Char} node endNode of current shortest path
 * @param {CharArray} trackedParents list of parents to each node
 * 
 * @returns {CharArray} currently shortest path from start to param node
 */
function generatePathFromParents(node, trackedParents) {

  let path = [node];
  let parent = trackedParents[node];

  while (parent && !path.includes('START')) {
    path.push(parent);
    parent = trackedParents[parent];
  }

  return path.reverse();
}

export {
  astar
};