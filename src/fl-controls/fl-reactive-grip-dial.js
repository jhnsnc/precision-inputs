import './fl-reactive-grip-dial.scss';

import {
  svgNS,
  defineSvgGradient,
  defineBlurFilter,
  defineDarkenFilter,
  defineMask,
  defineDropshadowFilter,
  createGroup,
  createRectangle,
  createCircle,
  createLine,
  createPath,
} from '../utils/svg';

import colors from './fl-colors';

import KnobInput from '../base/knob-input';

// TODO: remove unused
const sineIn = n => -Math.cos(n*Math.PI/2) + 1;
const sineOut = n => Math.sin(n*Math.PI/2);
const sineInOut = n => (-Math.cos(n*Math.PI) + 1) / 2;

let instanceCount = 0;

const thetaOffset = Math.PI/2;
const x = (r, theta) => 20 + r*Math.cos(thetaOffset + theta);
const y = (r, theta) => 20 + r*Math.sin(thetaOffset + theta);

// options:
//   - indicatorDotColor (string, hexcolor) - 'transparent' to disable (default = FL default color)
//   - guideTicks (int) - number of tick marks on the outer guide ring (default = 9)
//   - gripBumps (int) - number of grip bumps that appear when interacting with the dial (default = 5)
//   - gripExtrusion (Number) - the degree to which the grips 'cut' into the dial when the user interacts with it, range (0.0, 1.0) (default = 0.5)
//   - minRotation (Number) - angle of rotation corresponding to the `min` value, relative to pointing straight down (default = pointing to the first notch)
//   - maxRotation (Number) - angle of rotation corresponding to the `max` value, relative to pointing straight down (default = pointing to the last notch)
export default class FLReactiveGripDial extends KnobInput {
  constructor(containerElement, options = {}) {
    // make sure containerElement is valid
    if (!containerElement) {
      throw new Error('FLReactiveGripDial constructor must receive a valid container element');
    }

    // options
    const indicatorDotColor = typeof options.indicatorDotColor !== 'undefined' ? options.indicatorDotColor : colors.default.str;
    const guideTicks = typeof options.guideTicks === 'number' ? options.guideTicks : 9;
    const gripBumps = typeof options.gripBumps === 'number' ? options.gripBumps : 5;
    const gripExtrusion = typeof options.gripExtrusion === 'number' ? options.gripExtrusion : 0.5;
    const minRotation = typeof options.minRotation === 'number' ? options.minRotation : (0.5/guideTicks) * 360;
    const maxRotation = typeof options.maxRotation === 'number' ? options.maxRotation : (1-(0.5/guideTicks)) * 360;

    // construct visual element and attach to DOM
    const visualElement = FLReactiveGripDial._constructVisualElement(indicatorDotColor, guideTicks, minRotation, maxRotation);

    // create visual update functions
    options.visualContext = FLReactiveGripDial._getVisualSetupFunction(minRotation, maxRotation);
    options.updateVisuals = FLReactiveGripDial._getVisualUpdateFunction();

    containerElement.classList.add('fl-reactive-grip-dial');
    containerElement.appendChild(visualElement);

    // call constructor
    super(containerElement, visualElement, options);

    // morph grip dial shape on hover
    this.gripBumps = gripBumps;
    this.gripExtrusion = gripExtrusion;
    this.activeMorph = {
      id: null, // RAF ID
      progress: 0.0,
      startTime: 0,
      targetTime: 0,
      direction: 1,
    };
    this.mouseX = 0;
    this.mouseY = 0;

    this._reactiveDialHandlers = {
      hover: this.handleHover.bind(this),
      move: this.handleMove.bind(this),
      unhover: this.handleUnhover.bind(this),
      dragStart: this.handleDragStart.bind(this),
      dragEnd: this.handleDragEnd.bind(this),
    };

    this.addEventListener('mouseover', this._reactiveDialHandlers.hover);
    this.addEventListener('knobdragstart', this._reactiveDialHandlers.dragStart);
  }

  handleHover(evt) {
    // update mouse position
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    // start hover
    this.startHoverEffect();
  }

  handleMove(evt) {
    // update mouse position
    this.mouseX = evt.clientX;
    this.mouseY = evt.clientY;
    // check if still hovering
    const dims = this._input.getBoundingClientRect();
    if (evt.clientX < dims.left || evt.clientX > dims.right || evt.clientY < dims.top || evt.clientY > dims.bottom) {
      // out of bounds, end hover
      this.stopHoverEffect();
    }
  }

  handleUnhover(evt) {
    this.stopHoverEffect();
  }

  handleDragStart(evt) {
    this.startHoverEffect();
  }

  handleDragEnd(evt) {
    this.stopHoverEffect();
  }

  startHoverEffect() {
    // add event listeners
    document.body.addEventListener('mousemove', this._reactiveDialHandlers.move);
    this.addEventListener('mouseout', this._reactiveDialHandlers.unhover);
    this.addEventListener('knobdragend', this._reactiveDialHandlers.dragEnd);

    // start tween
    this.morphGripShape(1.0);
    // TODO: actually tween
  }

  stopHoverEffect() {
    // if a drag is still active or the mouse is still hovering, do not stop effect
    const dims = this._input.getBoundingClientRect();
    const isHovering = this.mouseX >= dims.left && this.mouseX <= dims.right && this.mouseY >= dims.top && this.mouseY <= dims.bottom;
    if (isHovering || this._activeDrag) {
      return false;
    }

    // remove event listeners
    document.body.removeEventListener('mousemove', this._reactiveDialHandlers.move);
    this.removeEventListener('mouseout', this._reactiveDialHandlers.unhover);
    this.removeEventListener('knobdragend', this._reactiveDialHandlers.dragEnd);

    // end tween
    this.morphGripShape(0.0);
    // TODO: actually tween
  }

  static _constructVisualElement(indicatorDotColor, guideTicks, minRotation, maxRotation) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('fl-reactive-grip-dial__svg');
    svg.setAttribute('viewBox', '0 0 40 40');

    // container for defs specific to this dial instance
    const defs = document.createElementNS(svgNS, 'defs');
    const initialGripPath = 'M20,33A13,13,0,0,1,20,7A-13,13,0,0,1,20,33Z';
    const gripMask = document.createElementNS(svgNS, 'mask');
    gripMask.id = `mask__fl-reactive-grip__grip-outline--${instanceCount++}`;
    const gripMaskPath = createPath(initialGripPath, {
      classes: 'fl-reactive-grip-dial__grip-mask-path',
      fill: '#ffffff',
    });
    gripMask.appendChild(gripMaskPath);
    defs.appendChild(gripMask);

    // guides
    const minTheta = minRotation * Math.PI / 180;
    const maxTheta = maxRotation * Math.PI / 180;
    const thetaDelta = maxTheta - minTheta;
    const guides = createGroup({ classes: 'fl-reactive-grip-dial__guides' });
    const guideRing = createPath(`M${x(16,minTheta)},${y(16,minTheta)}A16,16,0,0,1,20,4A-16,16,0,0,1,${x(16,maxTheta)},${y(16,maxTheta)}`, {
      classes: 'fl-reactive-grip-dial__guide-ring',
      stroke: '#32383c',
      strokeWidth: 3,
      strokeLinecap: 'round',
    });
    const guideTickMarks = [];
    for (let i=0; i<guideTicks; i++) {
      let theta = minTheta + i*thetaDelta/(guideTicks-1);
      guideTickMarks.push( createLine(x(19.5,theta), y(19.5,theta), x(14.5,theta), y(14.5,theta),{
        classes: 'fl-reactive-grip-dial__guide-tick',
        stroke: '#23292d',
      }) );
    }
    guides.appendChild(guideRing);
    guideTickMarks.forEach(el => guides.appendChild(el));

    // dial grip
    const grip = createGroup({
      classes: 'fl-reactive-grip-dial__grip',
      filter: defineDropshadowFilter('filter__fl-reactive-grip-dial__drop-shadow', 0x23292d, 0.3, 0, 2, 0.3),
    });
    const gripFill = createRectangle(6, 6, 28, 28, {
      classes: 'fl-reactive-grip-dial__grip-fill',
      fill: defineSvgGradient('grad__fl-reactive-grip-dial__grip-fill', 'radial', {cx: 0.5, cy: -0.2, r: 1.2, fx: 0.5, fy: -0.2}, {
        '0%': '#8b9499',
        '70%': '#10191e',
        '100%': '#2b3439',
      }),
      mask: `url(#${gripMask.id})`,
    });
    const gripOutline = createPath(initialGripPath, {
      classes: 'fl-reactive-grip-dial__grip-outline',
      stroke: '#23292d',
      strokeWidth: 0.5,
    });
    const indicatorDot = createCircle(x(10.5,0), y(10.5,0), 1, {
      classes: 'fl-reactive-grip-dial__indicator-dot',
      fill: indicatorDotColor,
    });
    grip.appendChild(gripFill);
    grip.appendChild(gripOutline);
    grip.appendChild(indicatorDot);

    // dial top
    const chrome = createGroup({ classes: 'fl-reactive-grip-dial__chrome' });
    const blurMain = defineBlurFilter('filter__fl-reactive-grip-dial__blur-base', 1.5);
    const blurHighlight = defineBlurFilter('filter__fl-reactive-grip-dial__blur-base', 0.5);
    const gradColorStops = {
      '0%': { color: '#ffffff', opacity: 0.0 },
      '100%': { color: '#ffffff', opacity: 0.12 },
    };
    const chromeGradientA = defineSvgGradient('grad__fl-reactive-grip-dial__gradient-a', 'linear', {x1:0, y1:0, x2:0, y2:1}, gradColorStops);
    const chromeGradientB = defineSvgGradient('grad__fl-reactive-grip-dial__gradient-b', 'linear', {x1:0, y1:1, x2:0, y2:0}, gradColorStops);
    const chromeGradientC = defineSvgGradient('grad__fl-reactive-grip-dial__gradient-c', 'linear', {x1:0, y1:0, x2:1, y2:0}, gradColorStops);
    const chromeGradientD = defineSvgGradient('grad__fl-reactive-grip-dial__gradient-d', 'linear', {x1:1, y1:0, x2:0, y2:0}, gradColorStops);
    const darken = defineDarkenFilter('filter__fl-reactive-grip-dial__darken', 0.75, 0.05);

    // dial top - chrome base
    const chromeBase = createGroup({
      classes: 'fl-reactive-grip-dial__chrome-base',
      mask: defineMask('mask__fl-reactive-grip__chrome-base', [ createCircle(20, 20, 8, { fill: '#ffffff' }) ]),
      transform: 'rotate(-25 20 20)'
    });
    const chromeBaseMain = createGroup({ filter: blurMain });
    chromeBaseMain.appendChild( createRectangle(12, 12, 16, 16, { fill: '#383d3f' }) );
    chromeBaseMain.appendChild( createRectangle(12, 12, 8, 16, { fill: chromeGradientA }) );
    chromeBaseMain.appendChild( createRectangle(20, 12, 8, 16, { fill: chromeGradientB }) );
    chromeBaseMain.appendChild( createRectangle(12, 12, 16, 8, { fill: chromeGradientC }) );
    chromeBaseMain.appendChild( createRectangle(12, 20, 16, 8, { fill: chromeGradientD }) );
    chromeBaseMain.appendChild( createLine(12, 28, 19, 21, { stroke: '#ffffff', strokeOpacity: 0.8 }) );
    chromeBaseMain.appendChild( createLine(21, 19, 28, 12, { stroke: '#ffffff', strokeOpacity: 0.8 }) );
    chromeBase.appendChild(chromeBaseMain);
    chromeBase.appendChild( createLine(12, 28, 19.5, 20.5, { stroke: '#ffffff', strokeOpacity: 0.5, strokeWidth: 0.75, filter: blurHighlight }) );
    chromeBase.appendChild( createLine(20.5, 19.5, 28, 12, { stroke: '#ffffff', strokeOpacity: 0.5, strokeWidth: 0.75, filter: blurHighlight }) );

    // dial top - chrome ridges
    const chromeRidgesMaskItems = [];
    for (let i=1; i<11; i++) {
      chromeRidgesMaskItems.push( createCircle(20, 20, i*7.5/10, { stroke: '#ffffff', strokeWidth: 0.5*7.5/10 }) );
    }
    const chromeRidges = createGroup({
      classes: 'fl-reactive-grip-dial__chrome-ridges',
      mask: defineMask('mask__fl-reactive-grip__chrome-ridges', chromeRidgesMaskItems),
      transform: 'rotate(-19 20 20)',
      filter: darken
    });
    const chromeRidgesMain = createGroup({ filter: blurMain });
    chromeRidgesMain.appendChild( createRectangle(12, 12, 16, 16, { fill: '#383d3f' }) );
    chromeRidgesMain.appendChild( createRectangle(12, 12, 8, 16, { fill: chromeGradientA }) );
    chromeRidgesMain.appendChild( createRectangle(20, 12, 8, 16, { fill: chromeGradientB }) );
    chromeRidgesMain.appendChild( createRectangle(12, 12, 16, 8, { fill: chromeGradientC }) );
    chromeRidgesMain.appendChild( createRectangle(12, 20, 16, 8, { fill: chromeGradientD }) );
    chromeRidgesMain.appendChild( createLine(12, 28, 19, 21, { stroke: '#ffffff', strokeOpacity: 0.8 }) );
    chromeRidgesMain.appendChild( createLine(21, 19, 28, 12, { stroke: '#ffffff', strokeOpacity: 0.8 }) );
    chromeRidges.appendChild(chromeRidgesMain);
    chromeRidges.appendChild( createLine(12, 28, 19.5, 20.5, { stroke: '#ffffff', strokeOpacity: 0.5, strokeWidth: 0.75, filter: blurHighlight }) );
    chromeRidges.appendChild( createLine(20.5, 19.5, 28, 12, { stroke: '#ffffff', strokeOpacity: 0.5, strokeWidth: 0.75, filter: blurHighlight }) );

    // dial top - combine
    const chromeOutline = createCircle(20, 20, 8, {
      classes: 'fl-reactive-grip-dial__chrome-outline',
      stroke: '#23292d',
    });
    const chromeHighlight = createCircle(20, 20, 7.5, {
      classes: 'fl-reactive-grip-dial__chrome-highlight',
      stroke: '#70777d',
      strokeOpacity: 0.6,
    });
    chrome.appendChild(chromeBase);
    chrome.appendChild(chromeRidges);
    chrome.appendChild(chromeOutline);
    chrome.appendChild(chromeHighlight);

    // combine all
    svg.appendChild(defs);
    svg.appendChild(guides);
    svg.appendChild(grip);
    svg.appendChild(chrome);

    return svg;
  }

  morphGripShape(progress) {
    const evenSpacing = (Math.PI/this.gripBumps);
    const arcSpan = (2-progress) * evenSpacing;
    const bumpSpan = progress * evenSpacing;
    const bumpRadius = 13 / (18 * this.gripExtrusion + 1) * this.gripBumps;

    // write path data
    var gripPathData = `M${x(13,-arcSpan/2)},${y(13,-arcSpan/2)}`;
    var numBumps = 5
    for(var i=0; i<this.gripBumps; i++) {
      const arcAfter = (i*2)*evenSpacing + (arcSpan/2);
      const bumpAfter = (i*2+1)*evenSpacing + (bumpSpan/2);
      gripPathData += `A-13,13,0,0,1,${x(13,arcAfter)},${y(13,arcAfter)}`;
      gripPathData += `A-${bumpRadius},${bumpRadius},0,0,0,${x(13,bumpAfter)},${y(13,bumpAfter)}`;
    }
    gripPathData += 'Z';

    // update shapes
    this._visualContext.gripMask.setAttribute('d', gripPathData);
    this._visualContext.gripOutline.setAttribute('d', gripPathData);
  }

  static _getVisualSetupFunction(minRotation, maxRotation) {
    return function() {
      this.rotationDelta = maxRotation - minRotation;
      this.minRotation = minRotation;

      this.gripMask = this.element.querySelector('.fl-reactive-grip-dial__grip-mask-path');
      this.gripMask.style[`${this.transformProperty}Origin`] = '20px 20px';
      this.gripOutline = this.element.querySelector('.fl-reactive-grip-dial__grip-outline');
      this.gripOutline.style[`${this.transformProperty}Origin`] = '20px 20px';
      this.indicatorDot = this.element.querySelector('.fl-reactive-grip-dial__indicator-dot');
      this.indicatorDot.style[`${this.transformProperty}Origin`] = '20px 20px';
    };
  }

  static _getVisualUpdateFunction() {
    return function(norm) {
      const newRotation = this.minRotation + norm*this.rotationDelta;
      this.gripMask.style[this.transformProperty] = `rotate(${newRotation}deg)`;
      this.gripOutline.style[this.transformProperty] = `rotate(${newRotation}deg)`;
      this.indicatorDot.style[this.transformProperty] = `rotate(${newRotation}deg)`;
    };
  }
}
