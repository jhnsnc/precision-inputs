import './fl-reactive-grip-dial.scss';

import {
  svgNS,
  defineSvgGradient,
  defineBlurFilter,
} from '../utils/svg';

import colors from './fl-colors';

import KnobInput from '../base/knob-input';

// options:
//   - indicatorDotColor (string, hexcolor) - 'transparent' to disable (default = FL default color)
//   - notches (int) - number of notches in the outer ring
//   - gripBumps (int) - number of grip bumps that appear when interacting with the dial (default = 5)
//   - gripExtrusion (Number) - the degree to which the grips 'cut' into the dial when the user interacts with it, range (0.0, 1.0) (default = 0.6)
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

    // construct visual element and attach to DOM
    const visualElement = FLReactiveGripDial._constructVisualElement(indicatorDotColor);

    // create visual update functions
    options.visualContext = FLReactiveGripDial._getVisualSetupFunction();
    options.updateVisuals = FLReactiveGripDial._getVisualUpdateFunction();

    containerElement.classList.add('fl-reactive-grip-dial');
    containerElement.appendChild(visualElement);

    // call constructor
    super(containerElement, visualElement, options);
  }

  static _constructVisualElement(indicatorDotColor) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('fl-reactive-grip-dial__svg');
    svg.setAttribute('viewBox', '0 0 40 40');

    // FIXME
    defineBlurFilter('grad__fl-reactive-grip-dial__focus-indicator-glow', 2);
    const focusIndicator = document.createElementNS(svgNS, 'circle');
    focusIndicator.classList.add('fl-reactive-grip-dial__focus-indicator');
    focusIndicator.setAttribute('cx', 20);
    focusIndicator.setAttribute('cy', 20);
    focusIndicator.setAttribute('r', 18);
    focusIndicator.setAttribute('fill', indicatorDotColor);
    focusIndicator.setAttribute('filter', 'url(#grad__fl-reactive-grip-dial__focus-indicator-glow)');
    focusIndicator.style.setProperty('opacity', 0, 'important');

    const indicatorRingBg = document.createElementNS(svgNS, 'circle');
    indicatorRingBg.classList.add('fl-reactive-grip-dial__indicator-ring-bg');
    indicatorRingBg.setAttribute('cx', 20);
    indicatorRingBg.setAttribute('cy', 20);
    indicatorRingBg.setAttribute('r', 18);
    indicatorRingBg.setAttribute('fill', '#353b3f');
    indicatorRingBg.setAttribute('stroke', '#23292d');

    const indicatorRing = document.createElementNS(svgNS, 'path');
    indicatorRing.classList.add('fl-reactive-grip-dial__indicator-ring');
    indicatorRing.setAttribute('d', 'M20,20Z');
    indicatorRing.setAttribute('fill', indicatorDotColor);

    // dial group
    const dial = document.createElementNS(svgNS, 'g');
    dial.classList.add('fl-reactive-grip-dial__dial');

    defineSvgGradient('grad__fl-reactive-grip-dial__soft-shadow', 'radial', {cx: 0.5, cy: 0.5, r: 0.5}, {
      '85%':  { color: '#242a2e', opacity: 0.4 },
      '100%': { color: '#242a2e', opacity: 0 },
    });
    const dialSoftShadow = document.createElementNS(svgNS, 'circle');
    dialSoftShadow.classList.add('fl-reactive-grip-dial__dial-soft-shadow');
    dialSoftShadow.setAttribute('cx', 20);
    dialSoftShadow.setAttribute('cy', 20);
    dialSoftShadow.setAttribute('r', 16);
    dialSoftShadow.setAttribute('fill', 'url(#grad__fl-reactive-grip-dial__soft-shadow)');

    const dialHardShadow = document.createElementNS(svgNS, 'ellipse');
    dialHardShadow.classList.add('fl-reactive-grip-dial__dial-hard-shadow');
    dialHardShadow.setAttribute('cx', 20);
    dialHardShadow.setAttribute('cy', 22);
    dialHardShadow.setAttribute('rx', 14);
    dialHardShadow.setAttribute('ry', 14.5);
    dialHardShadow.setAttribute('fill', '#242a2e');
    dialHardShadow.setAttribute('opacity', 0.15);

    defineSvgGradient('grad__fl-reactive-grip-dial__dial-base', 'linear', {x1:0, y1:0, x2:0, y2:1}, {
      '0%': '#52595f',
      '100%': '#2b3238',
    });
    const dialBase = document.createElementNS(svgNS, 'circle');
    dialBase.classList.add('fl-reactive-grip-dial__dial-base');
    dialBase.setAttribute('cx', 20);
    dialBase.setAttribute('cy', 20);
    dialBase.setAttribute('r', 14);
    dialBase.setAttribute('fill', 'url(#grad__fl-reactive-grip-dial__dial-base)');
    dialBase.setAttribute('stroke', '#242a2e');
    dialBase.setAttribute('stroke-width', 1.5);

    defineSvgGradient('grad__fl-reactive-grip-dial__dial-highlight', 'linear', {x1:0, y1:0, x2:0, y2:1}, {
      '0%':   { color: '#70777d', opacity: 1 },
      '40%':  { color: '#70777d', opacity: 0 },
      '55%':  { color: '#70777d', opacity: 0 },
      '100%': { color: '#70777d', opacity: 0.3 },
    });
    const dialhighlightStroke = document.createElementNS(svgNS, 'circle');
    dialhighlightStroke.classList.add('fl-reactive-grip-dial__dial-highlight-stroke');
    dialhighlightStroke.setAttribute('cx', 20);
    dialhighlightStroke.setAttribute('cy', 20);
    dialhighlightStroke.setAttribute('r', 13);
    dialhighlightStroke.setAttribute('fill', 'transparent');
    dialhighlightStroke.setAttribute('stroke', 'url(#grad__fl-reactive-grip-dial__dial-highlight)');
    dialhighlightStroke.setAttribute('stroke-width', 1.5);

    const dialHighlight = document.createElementNS(svgNS, 'circle');
    dialHighlight.classList.add('fl-reactive-grip-dial__dial-highlight');
    dialHighlight.setAttribute('cx', 20);
    dialHighlight.setAttribute('cy', 20);
    dialHighlight.setAttribute('r', 14);
    dialHighlight.setAttribute('fill', '#ffffff');

    const indicatorDot = document.createElementNS(svgNS, 'circle');
    indicatorDot.classList.add('fl-reactive-grip-dial__indicator-dot');
    indicatorDot.setAttribute('cx', 20);
    indicatorDot.setAttribute('cy', 30);
    indicatorDot.setAttribute('r', 1.5);
    indicatorDot.setAttribute('fill', indicatorDotColor);

    // combine dial
    dial.appendChild(dialSoftShadow);
    dial.appendChild(dialHardShadow);
    dial.appendChild(dialBase);
    dial.appendChild(dialhighlightStroke);
    dial.appendChild(dialHighlight);
    dial.appendChild(indicatorDot);

    // combine all
    svg.appendChild(focusIndicator);
    svg.appendChild(indicatorRingBg);
    svg.appendChild(indicatorRing);
    svg.appendChild(dial);

    return svg;
  }

  static _getVisualSetupFunction() {
    return function() {
      this.indicatorRing = this.element.querySelector('.fl-reactive-grip-dial__indicator-ring');
      var ringStyle = getComputedStyle(this.element.querySelector('.fl-reactive-grip-dial__indicator-ring-bg'));
      this.r = parseFloat(ringStyle.r) - (parseFloat(ringStyle.strokeWidth) / 2);
      this.indicatorDot = this.element.querySelector('.fl-reactive-grip-dial__indicator-dot');
      this.indicatorDot.style[`${this.transformProperty}Origin`] = '20px 20px';
    };
  }

  static _getVisualUpdateFunction() {
    return function(norm) {
      var theta = Math.PI*2*norm + 0.5*Math.PI;
      var endX = this.r*Math.cos(theta) + 20;
      var endY = this.r*Math.sin(theta) + 20;
      this.indicatorDot.style[this.transformProperty] = `rotate(${360*norm}deg)`;
    };
  }
}
