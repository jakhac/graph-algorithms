# graph algorithm visualizer
this tool allows you to draw your own graph and then select an algorithm to execute on your graph directly in your browser. the pathing of the algorithm will be highlighted during execution as well as the final result. 

visit our website from a desktop pc to try it: https://graph-algorithms.io

![user interface](images/interface_screenshot.PNG?raw=true "Title")

## features
below, the core features are listed:
  
 ### algorithms
- six shortest path algorithms including an explanation of functionality: dijkstra, a*, dfs, bfs, greedy naive, greedy smart
- run algorithms to see each execution step highlighted visually in the graph
- customizable animation speed
- display current execution state and number of steps for each algorithm
- highlight the final path at the end of execution and show cost for shortest path

### graphs
-	draggable nodes with customizable names, settable as start or target nodes for algorithm execution
-	directed edges, with user-defined or automatically set cost (based on the distance between nodes)
-	random graph generation with user-defined graph size
-	expport and import graphs as .grph-files

### usability
-	interactive tutorial explaining the user interface
-	help-section and explanatory tooltips with animated gifs
-	large and draggable canvas featuring a navigable minimap
-	change history with undo (ctrl + z) and redo (ctrl + y)

  
## built with
- html, css
- vanilla javascript

## authors
- **kevin katzkowski** - [github](https://github.com/katzkowski)
- **jakob hackstein** - [github](https://github.com/jakhac)
