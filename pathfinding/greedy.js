/**
 * Greedy implementation for pathfinding algorithms.
 *
 * Author: Jakob Hackstein
 * Updated: 29.02.2020
 */


/**
 * Function runs greedy algorithm and returns obj lit with results. If greedy runs in a cycle
 * then the shortestPath is the cycle and the animPath is the way till cycle is detected.
 * @param {Object} graph given graph
 * 
 * @returns {Object} obj including result, animPath, cost, iterations
 * 
 * 
 * Animation Pattern:
 * finish reached
 *    animationPath [singleDraw, node, edge, node, edge, .., node]
 *    result [node, edge, node, edge, .., node]
 *    cost = Integer
 * deadlock
 *    animationPath[singleDraw, node, edge, node, edge.., node]
 *    result[deadlock, node, edge, node, edge, .., node](highlights actual cycle!)
 *    cost = undefined
 * cycle
 *    animationPath[singleDraw, node, edge, node, edge.., edge]
 *    result[cycle, node, edge, node, edge, .., edge] (highlights actual cycle!)
 *    cost = undefined
 * 
 */
function greedy(graph) {

  // Initital variables
  let node = graph.START;
  let shortestPath = ['START'];
  let animPath = [];
  let costs = 0;
  let iterations = 0;

  while (!shortestPath.includes('FINISH')) {

    iterations++;
    let min = 1000;

    // handle deadlock
    if ((Object.keys(node)).length === 0) {
      animPath = [...shortestPath];
      animPath.unshift('singleDraw');
      shortestPath.unshift('deadlock');
      costs = undefined;
      break;
    }

    // Find minimum and update take node and min cost
    let it_node = node;

    for (let child in it_node) {

      if (child === 'FINISH') {
        min = it_node[child];
        node = child;
        break;
      }

      if (it_node[child] <= min) {
        min = it_node[child];
        node = child;
      }
    }

    // handle cycle
    if (shortestPath.includes(node)) {

      shortestPath.push(node);

      animPath = [...shortestPath];
      animPath.unshift('singleDraw');
      animPath.push('cycle');

      // find cycle for result animation
      let indexOfCycle = shortestPath.indexOf(node);
      shortestPath = shortestPath.slice(indexOfCycle, shortestPath.length);
      shortestPath.unshift('cycle');

      costs = undefined;

      break;
    }

    // handle base case: update path, cost and node
    costs += min;
    shortestPath.push(node);
    node = graph[node];
    animPath = [...shortestPath]
  }

  // add endNode for the animation and declare animPath, if finish could be reached
  shortestPath.push(shortestPath[-1])
  animPath = (animPath.length === 0) ? [...shortestPath] : animPath;

  return {
    result: shortestPath,
    animPath: animPath,
    cost: costs,
    iterations: iterations
  };
}

export {
  greedy
};
