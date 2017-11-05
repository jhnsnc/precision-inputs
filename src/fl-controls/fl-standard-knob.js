import './fl-standard-knob.scss';

import {
  svgNS,
  defineSvgGradient,
  defineBlurFilter,
} from '../utils/svg';

import colors from './fl-colors';

import KnobInput from '../base/knob-input';

// options:
//   - indicatorDot (boolean)
//   - ringType (string, enum: 'positive', 'negative', 'split')
//   - color (string, hexcolor)
export default class FLStandardKnob extends KnobInput {
  constructor(containerElement, options = {}) {
    // make sure containerElement is valid
    if (!containerElement) {
      throw new Error('FLStandardKnob constructor must receive a valid container element');
    }

    // options
    const showIndicatorDot = typeof options.indicatorDot !== 'undefined' ? options.indicatorDot : true;
    const indicatorRingType = typeof options.indicatorRingType !== 'undefined' ? options.indicatorRingType : 'positive';
    const color = typeof options.color !== 'undefined' ? options.color : colors.default;

    // construct visual element and attach to DOM
    const visualElement = FLStandardKnob._constructVisualElement(showIndicatorDot, color);

    // create visual update functions
    options.visualContext = FLStandardKnob._getVisualSetupFunction(showIndicatorDot);
    options.updateVisuals = FLStandardKnob._getVisualUpdateFunction(showIndicatorDot, indicatorRingType);

    containerElement.classList.add('fl-standard-knob');
    containerElement.appendChild(visualElement);

    // call constructor
    super(containerElement, visualElement, options);
  }

  static _constructVisualElement(showIndicatorDot, color) {
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('fl-standard-knob__svg');
    svg.setAttribute('viewBox', '0 0 40 40');

    defineBlurFilter('grad__fl-standard-knob__focus-indicator-glow', 2);
    const focusIndicator = document.createElementNS(svgNS, 'circle');
    focusIndicator.classList.add('fl-standard-knob__focus-indicator');
    focusIndicator.setAttribute('cx', 20);
    focusIndicator.setAttribute('cy', 20);
    focusIndicator.setAttribute('r', 18);
    focusIndicator.setAttribute('fill', color);
    focusIndicator.setAttribute('filter', 'url(#grad__fl-standard-knob__focus-indicator-glow)');

    const indicatorRingBg = document.createElementNS(svgNS, 'circle');
    indicatorRingBg.classList.add('fl-standard-knob__indicator-ring-bg');
    indicatorRingBg.setAttribute('cx', 20);
    indicatorRingBg.setAttribute('cy', 20);
    indicatorRingBg.setAttribute('r', 18);
    indicatorRingBg.setAttribute('fill', '#353b3f');
    indicatorRingBg.setAttribute('stroke', '#23292d');

    const indicatorRing = document.createElementNS(svgNS, 'path');
    indicatorRing.classList.add('fl-standard-knob__indicator-ring');
    indicatorRing.setAttribute('d', 'M20,20Z');
    indicatorRing.setAttribute('fill', color);

    // dial group
    const dial = document.createElementNS(svgNS, 'g');
    dial.classList.add('fl-standard-knob__dial');

    defineSvgGradient('grad__fl-standard-knob__soft-shadow', 'radial', {cx: 0.5, cy: 0.5, r: 0.5}, {
      '85%':  { color: '#242a2e', opacity: 0.4 },
      '100%': { color: '#242a2e', opacity: 0 },
    });
    const dialSoftShadow = document.createElementNS(svgNS, 'circle');
    dialSoftShadow.classList.add('fl-standard-knob__dial-soft-shadow');
    dialSoftShadow.setAttribute('cx', 20);
    dialSoftShadow.setAttribute('cy', 20);
    dialSoftShadow.setAttribute('r', 16);
    dialSoftShadow.setAttribute('fill', 'url(#grad__fl-standard-knob__soft-shadow)');

    const dialHardShadow = document.createElementNS(svgNS, 'ellipse');
    dialHardShadow.classList.add('fl-standard-knob__dial-hard-shadow');
    dialHardShadow.setAttribute('cx', 20);
    dialHardShadow.setAttribute('cy', 22);
    dialHardShadow.setAttribute('rx', 14);
    dialHardShadow.setAttribute('ry', 14.5);
    dialHardShadow.setAttribute('fill', '#242a2e');
    dialHardShadow.setAttribute('opacity', 0.15);

    defineSvgGradient('grad__fl-standard-knob__dial-base', 'linear', {x1:0, y1:0, x2:0, y2:1}, {
      '0%': '#52595f',
      '100%': '#2b3238',
    });
    const dialBase = document.createElementNS(svgNS, 'circle');
    dialBase.classList.add('fl-standard-knob__dial-base');
    dialBase.setAttribute('cx', 20);
    dialBase.setAttribute('cy', 20);
    dialBase.setAttribute('r', 14);
    dialBase.setAttribute('fill', 'url(#grad__fl-standard-knob__dial-base)');
    dialBase.setAttribute('stroke', '#242a2e');
    dialBase.setAttribute('stroke-width', 1.5);

    defineSvgGradient('grad__fl-standard-knob__dial-highlight', 'linear', {x1:0, y1:0, x2:0, y2:1}, {
      '0%':   { color: '#70777d', opacity: 1 },
      '40%':  { color: '#70777d', opacity: 0 },
      '55%':  { color: '#70777d', opacity: 0 },
      '100%': { color: '#70777d', opacity: 0.3 },
    });
    const dialhighlightStroke = document.createElementNS(svgNS, 'circle');
    dialhighlightStroke.classList.add('fl-standard-knob__dial-highlight-stroke');
    dialhighlightStroke.setAttribute('cx', 20);
    dialhighlightStroke.setAttribute('cy', 20);
    dialhighlightStroke.setAttribute('r', 13);
    dialhighlightStroke.setAttribute('fill', 'transparent');
    dialhighlightStroke.setAttribute('stroke', 'url(#grad__fl-standard-knob__dial-highlight)');
    dialhighlightStroke.setAttribute('stroke-width', 1.5);

    const dialHighlight = document.createElementNS(svgNS, 'circle');
    dialHighlight.classList.add('fl-standard-knob__dial-highlight');
    dialHighlight.setAttribute('cx', 20);
    dialHighlight.setAttribute('cy', 20);
    dialHighlight.setAttribute('r', 14);
    dialHighlight.setAttribute('fill', '#ffffff');

    let indicatorDot;
    if (showIndicatorDot) {
      indicatorDot = document.createElementNS(svgNS, 'circle');
      indicatorDot.classList.add('fl-standard-knob__indicator-dot');
      indicatorDot.setAttribute('cx', 20);
      indicatorDot.setAttribute('cy', 30);
      indicatorDot.setAttribute('r', 1.5);
      indicatorDot.setAttribute('fill', color);
    }

    // combine dial
    dial.appendChild(dialSoftShadow);
    dial.appendChild(dialHardShadow);
    dial.appendChild(dialBase);
    dial.appendChild(dialhighlightStroke);
    dial.appendChild(dialHighlight);
    if (showIndicatorDot) {
      dial.appendChild(indicatorDot);
    }

    // combine all
    svg.appendChild(focusIndicator);
    svg.appendChild(indicatorRingBg);
    svg.appendChild(indicatorRing);
    svg.appendChild(dial);

    return svg;
  }

  static _getVisualSetupFunction(showIndicatorDot) {
    return function() {
      this.indicatorRing = this.element.querySelector('.fl-standard-knob__indicator-ring');
      var ringStyle = getComputedStyle(this.element.querySelector('.fl-standard-knob__indicator-ring-bg'));
      this.r = parseFloat(ringStyle.r) - (parseFloat(ringStyle.strokeWidth) / 2);
      if (showIndicatorDot) {
        this.indicatorDot = this.element.querySelector('.fl-standard-knob__indicator-dot');
        this.indicatorDot.style[`${this.transformProperty}Origin`] = '20px 20px';
      }
    };
  }

  static _getVisualUpdateFunction(showIndicatorDot, ringType) {
    return function(norm) {
      var theta = Math.PI*2*norm + 0.5*Math.PI;
      var endX = this.r*Math.cos(theta) + 20;
      var endY = this.r*Math.sin(theta) + 20;
      // using 2 arcs rather than flags since one arc collapses if it gets near 360deg
      switch (ringType) {
        case 'positive':
        default:
          this.indicatorRing.setAttribute('d',`M20,20l0,${this.r}${norm>0.5?`A${this.r},${this.r},0,0,1,20,${20-this.r}`:''}A-${this.r},${this.r},0,0,1,${endX},${endY}Z`);
          break;
        case 'negative':
          this.indicatorRing.setAttribute('d',`M20,20l0,${this.r}${norm<0.5?`A-${this.r},${this.r},0,0,0,20,${20-this.r}`:''}A${this.r},${this.r},0,0,0,${endX},${endY}Z`);
          break;
        case 'split':
          this.indicatorRing.setAttribute('d',`M20,20l0,-${this.r}A${this.r},${this.r},0,0,${norm<0.5?0:1},${endX},${endY}Z`);
          break;
      }
      if (showIndicatorDot) {
        this.indicatorDot.style[this.transformProperty] = `rotate(${360*norm}deg)`;
      }
    };
  }
}
