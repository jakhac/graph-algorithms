/**
 * Depth First Search implementation for pathfinding algorithms.
 *
 * Author: Jakob Hackstein
 * Updated: 29.02.2020
 */

// Helper variables
let allTours;
let allToursToFinish;
let animationPath;
let iterations;

/**
 * Function runs the depthFirstSearch algorithm and returns obj literal
 * with shortestPath. Instructions for animation are inserted here.
 * 
 * @param {Object} graph given graph
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
function dfs(graph) {
  allTours = [];
  allToursToFinish = [];
  animationPath = ['START'];
  iterations = 0;
  let min = undefined;

  // run dfs
  depthFirstSearch(graph, graph.START, ['START'], 0);

  let shortestPath = [];
  // find min for shortestPath
  if (allToursToFinish.length > 0) {

    min = allToursToFinish[0][0];
    for (let i = 0; i < allToursToFinish.length; i++) {

      if (allToursToFinish[i][0] <= min) {
        min = allToursToFinish[i][0];
        shortestPath = [...allToursToFinish[i]];
      }
      allToursToFinish[i].shift();
    }
  }

  // remove cost for animPath and add fullDraw
  for (let i = 0; i < allTours.length; i++) {
    allTours[i].shift();
    allTours[i].push('fullDraw');
  }

  // find longest matching paths and add singleDraw
  for (let i = allTours.length - 1; i > 0; i--) {

    for (let j = 0; j < allTours[i].length; j++) {

      if (allTours[i][j] !== allTours[i - 1][j]) {
        allTours[i].splice(j, 0, 'singleDrawMid');
        break;
      }
    }
  }

  // remove cost from shortestPath
  shortestPath.shift();
  animationPath = [...allTours.flat()];
  animationPath.unshift('singleDraw')

  return {
    result: shortestPath,
    animPath: animationPath,
    cost: min,
    iterations: iterations
  };
}

/**
 * depth first search algorithm. Finds all paths reaching 'FINISH'
 * @param graph given graph
 * @param position startNode position at graph
 * @param path empty set for recursion purpose
 * @param costs initially 0
 */
function depthFirstSearch(graph, position, path, costs) {

  for (let child in position) {

    let currentPath = [...path];
    let currentCosts = costs;

    if (!currentPath.includes(child)) {

      iterations++;
      currentCosts += parseInt(position[child]);
      currentPath.push(child);

      // if current node is a deadlock
      if (child !== 'FINISH' && Object.keys(graph[child]).length === 0) {
        currentPath.unshift(currentCosts);
        allTours.push(currentPath);
      }

      // if finish is reached, mission abort
      if (child === 'FINISH') {
        currentPath.unshift(currentCosts);
        allTours.push(currentPath);
        allToursToFinish.push([...currentPath]);
      } else {
        depthFirstSearch(graph, graph[child], currentPath, currentCosts);
      }

    } else {

      // if cycle is detected
      currentPath.unshift(costs);
      currentPath.push(child, 'removeLastNode');
      allTours.push(currentPath);
    }
  }
}

export {
  dfs
};
