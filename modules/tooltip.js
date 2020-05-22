/**
 * This file contains the tooltip functionality.
 * 
 * Author: Kevin Katzkowski
 * Updated: 07.04.2020
  */

import { getHelpTopicDescription, getHelpTopicHeading, getGif } from './help.js';
import { tutorialActive } from './tutorial.js';

/**
 * true when a tooltip is visible
 */
var tooltipVisible = false;


/**
 * Shows a tooltip and calls the correct functions on button click.
 * 
 * @param {HTML object} referenceObj the object the tooltip refers to
 * @param {string} title tooltip title
 * @param {string} message tooltip message
 * @param {string} primaryActionText text for the primary action button
 * @param {string} primaryAction function to call on primary button click
 * @param {string} secondaryActionText text for the secondary action button
 * @param {string} secondaryAction function to call on secondary button click
 * @param {string} tertiaryActionText text for the tertiary action button
 * @param {string} tertiaryAction function to call on tertiary button click
 * @returns {HTML object} the tooltip 
 */
function show(referenceObj, title, message, primaryActionText, primaryAction, secondaryActionText, secondaryAction, tertiaryActionText, tertiaryAction) {

  // create tooltip window
  let base = document.createElement('div');
  base.setAttribute('class', 'tooltip');

  // tooltip heading
  let heading = document.createElement('h3');
  heading.style.color = 'var(--color-text-highlight-inverted);';
  heading.setAttribute('id', 'tooltip-title');
  heading.innerHTML = title;

  // tooltip text
  let text = document.createElement('p');
  text.setAttribute('class', 'tooltip-message');
  text.innerHTML = message;

  let textContainer = document.createElement('div');
  textContainer.setAttribute('class', 'text-container');

  let buttonbar = document.createElement('div');
  buttonbar.setAttribute('class', 'button-bar');

  // primary action button
  let buttonPrimary = document.createElement('button');
  buttonPrimary.setAttribute('class', 'primary');
  if (primaryActionText == 'overwrite' || primaryActionText == 'clear') {
    buttonPrimary.setAttribute('class', 'primary alert');
  }
  buttonPrimary.innerHTML = primaryActionText;

  // secondary action button
  let buttonSecondary = document.createElement('button');
  buttonSecondary.setAttribute('class', 'secondary-inverted');
  buttonSecondary.innerHTML = secondaryActionText;
  if (secondaryActionText == 'learn how') {
    buttonSecondary.setAttribute('id', 'learn-how');
  }

  // tertiary action button
  let buttonTertiary = document.createElement('button');
  buttonTertiary.setAttribute('class', 'secondary-inverted');
  buttonTertiary.innerHTML = tertiaryActionText;

  // add buttons to button bar
  if (tertiaryActionText != undefined) buttonbar.appendChild(buttonTertiary);
  if (secondaryActionText != undefined) buttonbar.appendChild(buttonSecondary);
  if (primaryActionText != undefined) buttonbar.appendChild(buttonPrimary);

  // add elements to tooltip base
  base.appendChild(heading);
  textContainer.appendChild(text);
  base.appendChild(textContainer);
  if (primaryActionText != undefined) base.appendChild(buttonbar);

  // add tooltip to body
  document.body.appendChild(base);
  tooltipVisible = true;
  setTooltipPosition(base, referenceObj)

  // execute primary action if primary button has been defined
  if (primaryActionText != undefined) {
    buttonPrimary.addEventListener('click', () => {
      if (primaryAction != undefined) primaryAction();
    });
  }

  // execute secondary action if secondary button has been defined
  if (secondaryActionText != undefined) {
    buttonSecondary.addEventListener('click', () => {
      if (secondaryAction != undefined) secondaryAction();
    });
  }

  // execute tertiary action if third button has been defined
  if (tertiaryActionText != undefined) {
    buttonTertiary.addEventListener('click', () => {
      if (tertiaryAction != undefined) tertiaryAction();
    });
  }

  return base;
}

/**
 * Shows a smaller tooltip without buttons.
 * 
 * @param {HTML object} referenceObj the object the tooltip refers to
 * @param {string} title tooltip title
 * @param {string} message tooltip message
 */
function showSmall(referenceObj, title, message) {
  let base = document.createElement('div');
  base.setAttribute('class', 'tooltip small');

  // tooltip heading
  let heading = document.createElement('h3');
  heading.innerHTML = title;

  // tooltip text
  let text = document.createElement('p');
  text.innerHTML = message;

  // add elements to tooltip base
  base.appendChild(heading);
  base.appendChild(text);

  // add tooltip to body
  document.body.appendChild(base);
  tooltipVisible = true;
  setTooltipPosition(base, referenceObj);
}

/**
 * Sets the position of the specified tooltip correctly by preventing off-screen
 * placements.
 * 
 * @param {HTML object} tooltip the html object representing the tooltip
 * @param {HTML object} referenceObj the object the tooltip refers to
 * @param {boolean} isHelp true if tooltip contains help instructions
 */
function setTooltipPosition(tooltip, referenceObj, isHelp) {

  // calculate position
  let x, y, height;
  if (!tutorialActive) {
    tooltip.style.display = 'inline-block';
    height = referenceObj.getBoundingClientRect().height;
    x = referenceObj.getBoundingClientRect().left;
    y = referenceObj.getBoundingClientRect().top + height;
  } else { 
    height = parseInt(referenceObj.style.height);
    x = parseInt(referenceObj.style.left);
    y = parseInt(referenceObj.style.top) + height;

    // get reference object width
    let width = parseInt(referenceObj.style.width);
   
    tooltip.style.display = 'inline-block';

    console.log(x + width + tooltip.offsetWidth);
    console.log(window.innerWidth);
    

    // place tooltip on screen if x + width is greater than window width
    if (x + width + tooltip.offsetWidth >= window.innerWidth) {
      // set tooltip below of highlight box
      tooltip.style.top = y + 'px';
      tooltip.style.left = x - 10 + 'px';
      tooltip.classList.add('pos-top');
      if(isHelp) {
        tooltip.classList.add('flat');
      } else {
        // place tooltip on screen if x + width is greater than window width
        if (x + tooltip.offsetWidth >= window.innerWidth) {
          tooltip.style.left = (x - tooltip.offsetWidth * 0.35) - 10 + 'px';
          tooltip.classList.add('pos-middle');
        } else if (x <= 10) { // prevent negative x offscreen placement 
          tooltip.style.left = 1 + 'rem';
        } else {
          tooltip.style.left = x - 10 + 'px';
        }
      }
    } else {
      // set tooltip right of highlight box
      tooltip.style.top = (y - height) + 'px';
      tooltip.style.left = x + width + 'px';
      tooltip.classList.add('pos-left');
    }
    
    return;
  }

  // place tooltip on screen if x + width is greater than window width
  if (x + tooltip.offsetWidth >= window.innerWidth) {
    tooltip.style.left = (x - tooltip.offsetWidth * 0.35) - 10 + 'px';
    tooltip.classList.add('pos-middle');
  } else if (x <= 10) { // prevent negative x offscreen placement 
    tooltip.style.left = 1 + 'rem';
  } else {
    tooltip.style.left = x - 10 + 'px';
  }

  // if tooltip contains help instructions
  if (isHelp) {
    // place tooltip on screen if y + height is greater than window height
    if (y + tooltip.offsetHeight >= window.innerHeight - height) {
      tooltip.style.top = (y - (y + tooltip.offsetHeight - window.innerHeight) - height) + 'px';
      tooltip.classList.add('pos-bottom');
    } else {
      tooltip.classList.add('pos-bottom');
      tooltip.style.top = y - 3 * height + 'px';
    } 
  } else {
    // place tooltip on screen if y + height is greater than window height
    if (y + tooltip.offsetHeight >= window.innerHeight) {
      tooltip.style.top = (y - 10 - tooltip.offsetHeight - height) + 'px';
      tooltip.classList.add('pos-bottom');
    } else {
      tooltip.style.top = y + 'px';
    }
  }
}


/**
 * Removes the text from the specified tooltip and instead adds an input field.
 * 
 * @param {HTML object} tooltip the html object representing the tooltip
 */
function showInput(tooltip) {
  // create form and input elements
  let form = document.createElement('form');

  // create input field
  let textInput = document.createElement('input');
  textInput.setAttribute('type', 'text');
  textInput.setAttribute('id', 'file-name');
  textInput.setAttribute('spellcheck', 'false');
  textInput.setAttribute('value', 'my-cool-graph');

  // file extension text
  let extension = document.createElement('span');
  extension.innerHTML = '.grph';

  // append elements to form
  form.appendChild(textInput);
  form.appendChild(extension);

  // get tooltip base element
  let base = tooltip;

  // get tooltip message of most recent tooltip
  let textContainer = document.getElementsByClassName('text-container');
  base.removeChild(textContainer[textContainer.length - 1]);

  // insert input field into tooltip 
  let buttonBar = base.childNodes[base.childElementCount - 1];
  base.insertBefore(form, buttonBar);
  tooltipVisible = true;
  textInput.select();
}

/**
 * Show help tooltip with text and gif.
 * 
 * @param {HTML object} tooltip the tooltip object
 * @param {data-help-topic} data the HTML data-tag of the help topic 
 * @param {HTML object} referenceObj the tooltips's reference object
 */
function showHelp(tooltip, data, referenceObj) {

  // create container element
  let helpContainer = document.createElement('div');
  helpContainer.setAttribute('class', 'help-container');

  if (!tutorialActive) {
    // get heading element
    let caption = document.getElementById('tooltip-title');
    caption.innerHTML = getHelpTopicHeading(data);

    // get text element
    let text = document.getElementsByClassName('tooltip-message');
    text[0].innerHTML = getHelpTopicDescription(data);
  } else {
    let textContainer = document.getElementsByClassName('text-container');

    // create help text element
    let text = document.createElement('p');
    text.setAttribute('class', 'tooltip-message');
    text.innerHTML = getHelpTopicDescription(data);

    // append text to container
    textContainer[textContainer.length - 1].append(text);
  }

  // create help gif
  let gif = document.createElement('img');
  gif.setAttribute('class', 'help-gif');
  gif.src = getGif(data);

  // append elements to container
  helpContainer.append(gif);

  if (!tutorialActive) {
    // get tooltip secondary button of most recent tooltip
    let secondaries = document.getElementsByClassName('secondary-inverted');

    // insert input field into tooltip 
    let buttonBar = tooltip.childNodes[tooltip.childElementCount - 1];
    tooltip.insertBefore(helpContainer, buttonBar);
    buttonBar.removeChild(secondaries[0]);
  } else {
    // append containter to tooltip
    tooltip.appendChild(helpContainer);
  }

  tooltip.classList.add('help');
  tooltipVisible = true;

  if (true) {
    // set timeout so tooltip rect can update before repositioning
    setTimeout(function () {
      setTooltipPosition(tooltip, referenceObj, true);
    }, 50);
  }
}

/**
 * Hides the specified tooltip.
 * 
 * @param {HTML object} tooltip the html object representing the tooltip
 */
function hide(tooltip, time = 0) {
  tooltipVisible = false;
  tooltip.style.opacity = '0.1';

  setTimeout(function () {
    document.body.removeChild(tooltip);
  }, time);
}

/**
 * Hides all currently visible tooltips.
 */
function hideAllTooltips() {
  let tooltips = document.getElementsByClassName('tooltip');

  if (tooltips != undefined) {
    for (let tooltip of tooltips) {
      hide(tooltip);
    }
  }
}

export { show, showSmall, showInput, showHelp, hide, hideAllTooltips, tooltipVisible }