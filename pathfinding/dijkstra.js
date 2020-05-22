/**
 * Dijkstra implementation for pathfinding algorithms.
 *
 * Author: Jakob Hackstein
 * Updated: 29.02.2020
 */


/**
 * Function returns the lowest connecting node.
 * 
 * @param {IntArray} costs list of known nodes
 * @param {CharArray} processed list with all procssed nodes in path
 * 
 * @returns {char} lowest connected node 
 */
function findLowestCostNode(costs, processed) {
  let knownNodes = Object.keys(costs);

  // remove finish if cost is still Infinity
  if (costs['FINISH'] === Infinity) {
    knownNodes.splice(knownNodes.indexOf('FINISH'), 1);
  }

  const lowestCostNode = knownNodes.reduce((lowest, node) => {
    // base case
    if (lowest === null && !processed.includes(node) && node !== 'START') {
      lowest = node;
    }
    // if not processed node is lower than stored node
    if (costs[node] < costs[lowest] && !processed.includes(node) && node !== 'START') {
      lowest = node;
    }
    return lowest;
  }, null); // initial value is null

  return lowestCostNode
}


/**
* Function runs dijkstra's algorithm and returns obj with result, animPath, iterations and cost.
* 
* @param graph given graph
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
function dijkstra(graph) {

  let trackedCosts = Object.assign({}, { FINISH: Infinity }, graph.START);
  let trackedParents = { FINISH: null };
  let animPath = [];
  let lastTakenNode = undefined;
  let iterations = 0;

  for (let child in graph.START) {
    trackedParents[child] = 'START'
  }

  let processedNodes = [];
  let node = findLowestCostNode(trackedCosts, processedNodes);
  lastTakenNode = node;

  while (node) {

    iterations++;

    let costToNode = trackedCosts[node];
    let childrenOfNode = graph[node];

    for (let child in childrenOfNode) {
      let costToChild = costToNode + childrenOfNode[child];

      if (!trackedCosts[child] || costToChild < trackedCosts[child]) {
        trackedCosts[child] = costToChild;
        trackedParents[child] = node;
      }

    }

    processedNodes.push(node);
    animPath.push(generatePathFromParents(node, trackedParents));
    node = findLowestCostNode(trackedCosts, processedNodes);

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

  // if finish was reached
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
  dijkstra
};
