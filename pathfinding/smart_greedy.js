/**
 * Smart Greedy implementation for pathfinding algorithms.
 *
 * Author: Jakob Hackstein
 * Updated: 29.02.2020
 */


/**
 * Function runs greedy algorithm and returns obj lit with results. 
 * Instructions for animation are inserted here.
 * 
 * @param {Object} graph given graph
 * 
 * @returns {Object} obj including result, animPath, cost, iterations
 * 
 * 
 * Animation Pattern:
 * finish reached
 *     animationPath [singleDraw, node, edge, node, edge, .. , node]
 *     result === [node, edge, node, edge, .. , node]
 *     cost = Integer
 * deadlock
 *     animationPath [singleDraw, node, edge, node, edge .. , node]
 *     result [deadlock, node, edge, node, edge, .. , node]
 *     cost = undefined
 * cycle
 *     animationPath [singleDraw, node, edge, node, edge .. , edge]
 *     result [cycle, node, edge, node, edge, .. , edge] (highlights actual cycle!)
 *     cost = undefined
 * 
 */
function smart_greedy(graph) {

  // Initital variables
  let node = graph.START;
  let shortestPath = ['START'];
  let animationPath = [];
  let processed = ['START'];
  let costs = 0;
  let iterations = 0;

  while (!shortestPath.includes('FINISH')) {

    let min = 1000;
    let it_node = node;
    iterations++;

    // handle deadlock
    if (!node || Object.keys(node).length === 0) {
      animationPath = [...shortestPath]
      shortestPath.unshift('deadlock');
      costs = undefined;
      break;
    }

    //handle cycle
    // if keys node is subset of processed
    let elements = new Set(processed);
    if (Object.keys(node).every((e) => elements.has(e))) {

      // add shortest node for animation purpose
      for (let child in it_node) {
        if (it_node[child] <= min) {
          min = it_node[child];
          node = child;
        }
      }
      shortestPath.push(node);
      animationPath = [...shortestPath]
      animationPath.push('cycle');

      // find cycle for result animation
      let indexOfCycle = shortestPath.indexOf(node);
      shortestPath = shortestPath.slice(indexOfCycle, shortestPath.length);
      shortestPath.unshift('cycle');

      costs = undefined;
      break;
    }

    // Find minimum and update take node and min cost
    for (let child in it_node) {
      // abort, finish reached
      if (child === 'FINISH') {
        min = it_node[child];
        node = child;
        break;
      }

      // check if minimum node is a valid path
      if (it_node[child] <= min && !processed.includes(child)) {
        min = it_node[child];
        node = child;
      }
    }

    // update
    costs += min;
    shortestPath.push(node);
    processed.push(node);
    node = graph[node];
  }

  if (!shortestPath.includes('deadlock') && !shortestPath.includes('cycle')) {
    animationPath = [...shortestPath];
  }

  animationPath.unshift('singleDraw');

  return {
    result: shortestPath,
    animPath: animationPath,
    cost: costs,
    iterations: iterations
  };
}

export {
  smart_greedy
};