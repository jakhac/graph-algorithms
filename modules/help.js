/**
 * Help system implementation
 * 
 * Author: Kevin Katzkowski
 * Updated: 19.06.2020
 */

import * as Tutorial from './tutorial.js';

const helpWindowContainer = document.getElementById('help-window-container'),
  helpWindow = document.getElementById('help-window'),
  closeHelpButton = document.getElementById('close-help'),
  helpButtons = document.getElementsByClassName('help-button'),
  helpTopicHeading = document.getElementById('help-topic-heading'),
  helpTopicText = document.getElementById('help-topic-description'),
  helpTopicGIF = document.getElementById('help-topic-gif'),
  takeTutorialButton = document.getElementById('take-tutorial-from-help');

// set initial help topic
let topic = 'select-algo';

// add help window close button event
closeHelpButton.addEventListener('click', closeHelp);
takeTutorialButton.addEventListener('click', function () {
  closeHelp();
  Tutorial.start();
})

// add event listeners to help buttons
for (let button of helpButtons) {
  button.addEventListener('click', (evt) => {
    // highlight clicked button
    for (let button of helpButtons) {
      button.classList.remove('selected');
    };
    evt.target.classList.add('selected');

    topic = evt.target.getAttribute('data-help-topic');

    loadHelp();
  }, false);
};

/**
 * Closes help window
 */
function closeHelp() {
  helpWindow.style.left = '-800px';
  helpWindowContainer.style.backgroundColor = 'rgba(0,0,0,0)';
  setTimeout(function () {
    helpWindowContainer.style.display = 'none';
  }, 200);
}

/**
 * Shows help window
 */
function showHelp() {
  // activate container 
  helpWindowContainer.style.display = 'block';

  // show help window
  setTimeout(function () {
    helpWindow.style.left = '0px';
  }, 100);

  // make background dark
  setTimeout(function () {
    helpWindowContainer.style.transition = '0.2s';
    helpWindowContainer.style.backgroundColor = 'rgba(0,0,0,0.4)';
  }, 50);

  loadHelp();
}

/**
 * Loads the help section for the selected topic.
 */
function loadHelp() {
  // remove previous gif
  helpTopicGIF.src = '';
  helpTopicGIF.style.display = 'none';

  // add placeholder background
  helpTopicGIF.parentNode.classList.add('gif-placeholder');
  helpTopicGIF.parentNode.style.lineHeight = helpTopicGIF.parentNode.getBoundingClientRect().height + 'px';

  // create placeholder text
  let p = document.createElement('p');
  p.innerHTML = getHelpTopicHeading(topic);
  helpTopicGIF.parentNode.appendChild(p);

  // load help content text
  helpTopicHeading.innerHTML = getHelpTopicHeading(topic);
  helpTopicGIF.title = getHelpTopicHeading(topic);
  helpTopicText.innerHTML = getHelpTopicDescription(topic);
  
  // load new gif and remove placeholder
  helpTopicGIF.src = getGif(topic);
  helpTopicGIF.onload = function () {
    helpTopicGIF.parentNode.removeChild(p);
    helpTopicGIF.style.display = 'block';
    helpTopicGIF.parentNode.classList.remove('gif-placeholder');
  }
  
}

/**
 * Returns the help topic heading of the specified topic.
 * 
 * @param {data-help-topic} data the HTML data-tag of the help topic 
 */
function getHelpTopicHeading(data) {
  switch (data) {
    case 'select-algo':
      return 'how to select an algorithm';

    case 'draw-node':
      return 'how to draw a node';

    case 'move-node':
      return 'how to move a node';

    case 'start-node':
      return 'how to set a start node';

    case 'target-node':
      return 'how to set a target node';

    case 'value-node':
      return 'how to change a node\'s value';

    case 'color-node':
      return 'how to change a node\'s color';

    case 'delete-node':
      return 'how to delete a node';

    case 'draw-edge':
      return 'how to draw an edge';

    case 'value-edge':
      return 'how to change an edge\'s value';

    case 'delete-edge':
      return 'how to delete an edge';
  }
}

/**
 * Returns the help topic description of the specified topic.
 * 
 * @param {data-help-topic} data the HTML data-tag of the help topic 
 */
function getHelpTopicDescription(data) {
  switch (data) {
    case 'select-algo':
      return 'click <span class="key-press">left mouse</span> to select an algorithm.';

    case 'draw-node':
      return 'click <span class="key-press">left mouse</span> to draw a node onto the canvas.';

    case 'move-node':
      return 'hold <span class="key-press">left mouse</span> and move your mouse to drag a node to a new position.';

    case 'start-node':
      return 'click <span class="key-press">right mouse</span> with your cursor above a node and then select <span class="key-press">set start</span> from the menu.';

    case 'target-node':
      return 'click <span class="key-press">right mouse</span> with your cursor above a node and then select <span class="key-press">set target</span> from the menu.';

    case 'value-node':
      return 'click <span class="key-press">right mouse</span> with your cursor above a node and then select <span class="key-press">change value</span> from the menu. enter the new value and then click on <span class="key-press">save</span>.';

    case 'color-node':
      return 'click <span class="key-press">right mouse</span> with your cursor above a node and then select <span class="key-press">change color</span> from the menu. then select the new color.';

    case 'delete-node':
      return 'click <span class="key-press">right mouse</span> with your cursor above a node and then select <span class="key-press">delete node</span> from the menu.';

    case 'draw-edge':
      return 'click <span class="key-press">left mouse</span> with your cursor above a node. a blue mask will show up. now move your mouse to another node and click on it. you can also click anywhere to create a node and automatically connect the edge to it.';

    case 'value-edge':
      return 'click <span class="key-press">right mouse</span> with your cursor above th edge and then select <span class="key-press">change value</span> from the menu. enter the new value and then click on <span class="key-press">save</span>.';

    case 'delete-edge':
      return 'click <span class="key-press">right mouse</span> with your cursor above the edge and then select <span class="key-press">delete edge</span> from the menu.';
  }
}

/**
 * Returns the path to the help Gif that belongs to the specified help topic.
 * 
 * @param {data-help-topic} data the HTML data-tag of the help topic 
 */
function getGif(data) {
  return '/images/gifs/' + data + '.gif';
}

export { showHelp, closeHelp, getHelpTopicDescription, getHelpTopicHeading, getGif }