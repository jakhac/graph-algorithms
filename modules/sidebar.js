/**
 * Context menu implementation for user interface interaction.
 * 
 * Author: Kevin Katzkowski
 * Updated: 23.05.2020
 */

import * as App from '/app.js';
import * as Animation from './animate.js';
import * as Canvas from './canvas.js';
import * as Context from './context.js';
import * as Minimap from './minimap.js';
import * as Tooltip from './tooltip.js';
import * as AlgoSelect from './algorithm-selection.js';
import { saveCurrentState } from './undo-redo.js';
import * as Help from './help.js';
import * as Tutorial from './tutorial.js';

// sidebar elements references
const sidebar = document.getElementById('sidebar'),
  dayNightButton = document.getElementById('day-night'),
  startButton = document.getElementById('start'),
  resultButton = document.getElementById('result'),
  clearButton = document.getElementById('clear'),
  randomButton = document.getElementById('random'),
  exportButton = document.getElementById('export'),
  importButton = document.getElementById('import'),
  speedSlider = document.getElementById('speed-slider'),
  sizeSlider = document.getElementById('size-slider'),
  checkboxAutoScroll = document.getElementById('checkbox-auto-scroll'),
  checkboxDistanced = document.getElementById('checkbox-distanced-edges'),
  fileElem = document.getElementById('fileElem');

// stored user theme preference
var storedTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

// true when the dark theme is active
var darkThemeActive;

// sidebar width in pixels
var sidebarWidth = 260;

var randomGraphInitialEdgeCount;


// default values for Firefox reload
speedSlider.value = 4;
sizeSlider.value = 2;


/**
 * Updates the animation speed on speed slider state change.
 */
speedSlider.addEventListener('input', evt => {
  let value = evt.srcElement.value,
    sliderStateText = document.getElementById('speed-slider-state');

  // set speed
  switch (value) {
    case '1':
      sliderStateText.textContent = 'execution speed: slower';
      Animation.setSpeedFactor(1.75);
      break;

    case '2':
      sliderStateText.textContent = 'execution speed: slow';
      Animation.setSpeedFactor(1.5);
      break;

    case '3':
      sliderStateText.textContent = 'execution speed: steady';
      Animation.setSpeedFactor(1.25);
      break;

    case '5':
      sliderStateText.textContent = 'execution speed: moderate';
      Animation.setSpeedFactor(0.5);
      break;

    case '6':
      sliderStateText.textContent = 'execution speed: fast';
      Animation.setSpeedFactor(0.25);
      break;

    case '7':
      sliderStateText.textContent = 'execution speed: insane';
      Animation.setSpeedFactor(0.05);
      break;

    default:
      sliderStateText.textContent = 'execution speed: medium';
      Animation.setSpeedFactor(1.0);
      break;
  }
});

/**
 * Updates the random graph size on size slider state change.
 */
sizeSlider.addEventListener('input', evt => {
  let value = evt.srcElement.value,
    sliderStateText = document.getElementById('size-slider-state');

  // set random graph size
  switch (value) {
    case '1':
      sliderStateText.textContent = 'random graph size: small';
      App.graph.graphSize = 's';
      break;

    case '3':
      sliderStateText.textContent = 'random graph size: large';
      App.graph.graphSize = 'l';
      break;

    default:
      sliderStateText.textContent = 'random graph size: medium';
      App.graph.graphSize = 'm';
      break;
  }
});

/**
 * Sets distanced graph mode on checkbox click.
 */
checkboxDistanced.addEventListener('input', evt => {
  console.log(evt.target.checked);

  if (evt.target.checked == true) {
    App.graph.isDistanced = true;
  } else {
    App.graph.isDistanced = false;
  }
  Canvas.update();
});

/**
 * Sets auto scrolling mode on checkbox click.
 */
checkboxAutoScroll.addEventListener('input', evt => {
  if (evt.target.checked == true) {
    Animation.setAutoScrollingAllowed(true);
  } else {
    Animation.setAutoScrollingAllowed(false);
  }
});

/**
 * Swap between dark and light theme
 */
dayNightButton.addEventListener('click', switchTheme, false);

/**
 * Switches between light and dark theme. 
 */
function switchTheme() {
  let theme = document.documentElement.getAttribute('data-theme');

  if (theme == 'dark') {
    document.documentElement.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
    console.log('storedTheme: ' + storedTheme);

    updateTheme();
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateTheme();
  }
}

/**
 * Updates the theme to stored preference or user selection.
 */
function updateTheme() {
  let theme = document.documentElement.getAttribute('data-theme');

  // set user preference if available
  storedTheme = getStoredTheme();
  if (storedTheme != null) {
    document.documentElement.setAttribute('data-theme', storedTheme);
    theme = storedTheme;
  }

  if (theme == 'dark') {
    dayNightButton.innerHTML = 'light' // change theme button text 
    darkThemeActive = true;
    document.getElementById('landing-img').src = './images/graph-dark.png';
  } else {
    dayNightButton.innerHTML = 'dark' // change theme button text 
    darkThemeActive = false;
    document.getElementById('landing-img').src = './images/graph-light.png';
  }
  Canvas.drawGrid();
  Canvas.redrawGraph();
  Minimap.drawMiniMap();
}

/**
 * Returns the stored theme, user system preference theme, or null.
 */
function getStoredTheme() {
  let theme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;

  // check for user system ence
  if (theme == null) {
    if (!window.matchMedia) {
      theme = null;
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = 'dark';
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      theme = 'light';
    }
  }
  return theme;
}

/**
 * On run algorithm button click, start the animation of the currently selected
 * algorithm if possible.
 */
startButton.addEventListener('click', evt => {

  if (App.getAnimating()) {
    Animation.abort();
    App.setAnimating(false);
    Canvas.update();
  } else {
    let key = AlgoSelect.getSelectedAlgorithmKey();
    if (key) {
      // show error if start or target is undefined
      if (App.graph.currentStartNode == undefined && App.graph.currentEndNode == undefined) {
        // show feedback
        let tooltip = Tooltip.show(
          startButton,
          'start and target node missing',
          'set a node as the algorithms start and another as a the target to start execution!',
          'got it',
          undefined,
          'learn how',
          function () { Tooltip.showHelp(tooltip, 'start-node', startButton); }
        );
      } else if (App.graph.currentStartNode == undefined) {
        // show feedback
        let tooltip = Tooltip.show(
          startButton,
          'start node missing',
          'set a node as the algorithms target to start execution!',
          'got it',
          undefined,
          'learn how',
          function () { Tooltip.showHelp(tooltip, 'start-node', startButton); }
        );
      } else if (App.graph.currentEndNode == undefined) {
        // show feedback
        let tooltip = Tooltip.show(
          startButton,
          'target node missing',
          'set a node as the algorithms target to start execution!',
          'got it',
          undefined,
          'learn how',
          function () { Tooltip.showHelp(tooltip, 'target-node', startButton); }
        );
      } else {
        let path = App.graph.runAlgorithm(key);
        App.setAnimating(true);

        Animation.start(path);

        // during tutorial, go to next step
        if (Tutorial.tutorialActive) {
          Tutorial.continueTutorial();
        }
      }
    } else {
      // show feedback
      let tooltip = Tooltip.show(
        startButton,
        'no algorithm selected',
        'select an algorithm to start execution!',
        'got it',
        undefined,
        'learn how',
        function () { Tooltip.showHelp(tooltip, 'select-algo', startButton); }
      );
    }
  }
});

/**
 * On result button click, highlight the result path of the currently selected 
 * algorithm if possible.
 */
resultButton.addEventListener('click', function () {

  let key = AlgoSelect.getSelectedAlgorithmKey();
  if (key) {
    // throw error if start or target is undefined
    if (App.graph.currentStartNode == undefined && App.graph.currentEndNode == undefined) {
      // show feedback
      let tooltip = Tooltip.show(
        resultButton,
        'start and target node missing',
        'set a node as the algorithms start and another as a the target to start execution!',
        'got it',
        undefined,
        'learn how',
        function () { Tooltip.showHelp(tooltip, 'start-node', startButton); }
      );
    } else if (App.graph.currentStartNode == undefined) {
      // show feedback
      let tooltip = Tooltip.show(
        resultButton,
        'start node missing',
        'set a node as the algorithms target to start execution!',
        'got it',
        undefined,
        'learn how',
        function () { Tooltip.showHelp(tooltip, 'start-node', startButton); }
      );
    } else if (App.graph.currentEndNode == undefined) {
      // show feedback
      let tooltip = Tooltip.show(
        resultButton,
        'target node missing',
        'set a node as the algorithms target to start execution!',
        'got it',
        undefined,
        'learn how',
        function () { Tooltip.showHelp(tooltip, 'target-node', startButton); }
      );
    } else {
      let path = App.graph.runAlgorithm(key);
      App.setAnimating(true);
      Animation.result(path);
    }
  } else {
    // show feedback
    let tooltip = Tooltip.show(
      resultButton,
      'no algorithm selected',
      'select an algorithm to start execution!',
      'got it',
      undefined,
      'learn how',
      function () { Tooltip.showHelp(tooltip, 'select-algo', startButton); }
    );
  }
});

/**
 * On random button click, draw a new random graph onto the canvas.
 */
randomButton.addEventListener('click', function () {

  if (App.getAnimating()) {
    // show dialog to confirm
    Tooltip.show(
      randomButton,
      'algorithm execution will be aborted',
      'generating a random graph will abort the current algorithm execution and overwrite your graph. you can save your current graph by exporting it.',
      'overwrite',
      App.generateRandomGraph,
      'export',
      function () { document.getElementById('export').click(); },
      'cancel'
    );
  } else if (App.graph.edgeList.length != randomGraphInitialEdgeCount && App.graph.edgeList.length != 0) {
    // check for additional edges after random graph drawing
    Tooltip.show(
      randomButton,
      'graph will be overwritten',
      'generating a random graph will overwrite your current graph. you can save your graph by exporting it.',
      'overwrite',
      function () {
        App.generateRandomGraph();
        randomGraphInitialEdgeCount = App.graph.edgeList.length;
      },
      'export',
      function () { document.getElementById('export').click(); },
      'cancel'
    );
  } else {
    App.generateRandomGraph();

    // store edge count for overwrite dialogue
    randomGraphInitialEdgeCount = App.graph.edgeList.length;
  }
});


/**
 * On clear button click, clear the canvas.
 */
clearButton.addEventListener('click', function () {

  if (App.getAnimating()) {
    // show dialog to confirm
    Tooltip.show(
      clearButton,
      'execution will be aborted',
      'clearing the canvas will abort the algorithm execution and delete your graph. ',
      'clear',
      App.resetApplicationState,
      'cancel'
    );
  } else if (App.graph.edgeList.length != 0) {
    // show dialog to confirm
    Tooltip.show(
      clearButton,
      'graph will be deleted',
      'clearing the canvas will delete your graph. you can save your graph by exporting it.',
      'clear',
      App.resetApplicationState,
      'export',
      function () { document.getElementById('export').click(); },
      'cancel'
    );
  } else {
    App.resetApplicationState();
  }
});

/**
 * Export graph as .grph-file with custom file name.
 */
exportButton.addEventListener('click', evt => {
  if (App.graph.nodeList.length > 0) {
    // show dialog to confirm
    let tooltip = Tooltip.show(
      exportButton,
      'enter a file name',
      undefined,
      'export',
      function () {
        let value = document.getElementById('file-name').value;
        App.graph.exportGraph(value);
      },
      'cancel'
    );
    Tooltip.showInput(tooltip);
  } else {
    // empty graph is not saved
    let tooltip = Tooltip.show(
      exportButton,
      'nothing to export',
      'draw something onto the canvas to export it.',
      'got it',
      undefined,
      'learn how',
      function () { Tooltip.showHelp(tooltip, 'draw-node', startButton); }
    );
  }
});

/**
 * Trigger hidden import button.
 */
importButton.addEventListener('click', openFileBrowser, false);


/**
 * Load imported graph from file.
 */
fileElem.addEventListener('input', function () {

  // save first FileList file from input type file
  let file = this.files[0];
  let reader = new FileReader();
  let output;

  // function onload is triggered as soon as readAsText is available
  reader.onload = function () {

    if (App.isGrphExtension(file.name)) {
      output = reader.result;
      App.graph.importGraph(output);
      Canvas.update();
      Animation.reset();

      // save to undo history
      saveCurrentState();
    } else {
      // tooltip on wrong import file format
      let tooltip = Tooltip.show(
        importButton,
        'wrong file format',
        'make sure to only import files with a .grph extension.',
        'import',
        function () { openFileBrowser(); },
        'cancel',
        undefined
      );
    }
  }
  console.log(file);
  reader.readAsText(file);
});

/**
 * On help button click, show help.
 */
document.getElementById('help').addEventListener('click', function () {
  AlgoSelect.deselectAlgButtons();
  AlgoSelect.loadAlgoInfo('default');

  Help.showHelp();
});

/**
 * Hides all context menus on canvas click.
 */
sidebar.addEventListener('click', function () {
  Context.hideAllMenus();
});

/**
 * Returns the current width of the sidebar.
 */
function getSidebarWidth() {
  return sidebarWidth;
}

/**
 * Opens local file browser to select a file for import.
 */
function openFileBrowser() {
  // trigger hidden input file button
  fileElem.value = null;
  if (fileElem) {
    fileElem.click();
  }
}

export { darkThemeActive, getSidebarWidth, updateTheme };