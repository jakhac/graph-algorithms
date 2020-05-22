/**
 * Breadth First Search implementation for pathfinding algorithms.
 *
 * Author: Jakob Hackstein
 * Updated: 29.02.2020
 */

let allPaths;
let allPathsToFinish;
let shortestPath;
let animPath;
let iterations;

/**
 * Function runs the breadthFirstSearch algorithm and returns object
 * with shortestPath. Instructions for animation are inserted here.
 * 
 * @param graph given graph
 * 
 * @returns {Object} object including result, animPath, shortestPath, iterations
 * 
 * Animation Pattern:
 * finish reached
 *    animationPath [singleDraw, node, edge, node, fullDraw, node, edge, node, singleDraw, node, edge.. , node]
 *    result === [node, edge, node, edge, .. , node]
 *    cost = Integer
 * finish not reachable
 *    animationPath [singleDraw, node, edge, node, fullDraw, node, edge, node, singleDraw, node, edge.. , node]
 *    result === [noPathToFinish]
 *    cost = undefined
 * 
 */
function bfs(graph) {

  // reset all lists if bfs runs repeatedly
  allPaths = [];
  allPathsToFinish = [];
  shortestPath = [];
  iterations = 0;
  let cost;

  // run bfs function
  breadthFirstSearch(graph);

  animPath = [...allPaths];

  // add instructions to animPath
  for (let i = 0; i < animPath.length; i++) {

    animPath[i].shift();
    animPath[i].push('fullDraw');

    if (i > 0) {
      animPath[i].splice(animPath[i].length - 2, 0, 'singleDrawEdge');
    }
  }

  // find shortestPath
  if (allPathsToFinish.length > 0) {

    cost = allPathsToFinish[0][0];
    for (let i = 0; i < allPathsToFinish.length; i++) {

      if (allPathsToFinish[i][0] <= cost) {
        shortestPath = [...allPathsToFinish[i]];
        cost = allPathsToFinish[i][0];
      }
    }
  }

  // remove cost from shortestPath
  shortestPath.shift();

  return {
    result: shortestPath,
    animPath: animPath.flat(),
    cost: cost,
    iterations: iterations
  };
}

/**
 * Function runs the breadthFirstSearch algorithm. Modifies local variables
 * for further process.
 * 
 * @param {Object} g given graph
 */
function breadthFirstSearch(g) {

  allPaths = [[0, 'START']];
  allPathsToFinish = [];
  let pathCounter = 0;
  let connectingNodes;
  let lastNode = allPaths[pathCounter][allPaths[pathCounter].length - 1];

  while (allPaths[pathCounter]) {

    iterations++;

    // push all connecting nodes to queue
    lastNode = allPaths[pathCounter][allPaths[pathCounter].length - 1];
    connectingNodes = Object.keys(g[lastNode]);

    for (let i = 0; i < connectingNodes.length; i++) {

      let temp = [];

      // for each connectingNode create new path adding this node
      if (!allPaths[pathCounter].includes(connectingNodes[i]) && !allPaths[pathCounter].includes('FINISH')) {

        temp = [...allPaths[pathCounter]];
        temp.push(connectingNodes[i]);
        temp[0] += g[lastNode][connectingNodes[i]];

        allPaths.push(temp);
      }

      // add finished path to allPathsToFinish
      if (temp.includes('FINISH')) {
        allPathsToFinish.push([...temp]);
      }
    }

    pathCounter++;
  }

}

export {
  bfs
};
