import {
  crsvg,
  defineSvgGradient,
  defineBlurFilter,
} from '../utils/svg';

import colors from './fl-colors';

import KnobInput from '../base/knob-input';

import * as styles from './fl-standard-knob.scss';

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

    super(containerElement,
      {
        ...options,
        focusActiveClass: styles.focusActive,
        dragActiveClass: styles.dragActive,
      });

    // options
    this.indicatorRingType = typeof options.indicatorRingType !== 'undefined' ? options.indicatorRingType : 'positive';
    const color = typeof options.color === 'string' ? options.color : options.color && typeof options.color.str === 'string' ? options.color.str : colors.default.str;

    // construct visual element and attach to DOM
    const visualElement = this.createVisuals(
      typeof options.indicatorDot !== 'undefined' ? options.indicatorDot : true,
      color
    );
    containerElement.classList.add(styles.flStandardKnob);
    containerElement.appendChild(visualElement);

    // finalize
    this.setupVisuals(this.update.bind(this), visualElement);
  }

  createVisuals = (showIndicatorDot, color) => {
    const svg = crsvg('svg', { class: styles.flStandardKnobSvg, viewBox: '0 0 40 40' });

    defineBlurFilter('filter__fl-standard-knob__focus-indicator-glow', 2, 'none', 0.2);
    const focusIndicator = crsvg('circle',
      {
        class: styles.flStandardKnobFocusIndicator,
        cx: 20,
        cy: 20,
        r: 18,
        fill: color,
        filter: 'url(#filter__fl-standard-knob__focus-indicator-glow)',
      }
    );

    const indicatorRingBg = crsvg('circle', { cx: 20, cy: 20, r: 18, fill: '#353b3f', stroke: '#23292d' });

    this.indicatorRing = crsvg('path', { d: 'M20,20Z', fill: color });

    // dial group
    const dial = crsvg('g', { class: styles.flStandardKnobDial });

    defineSvgGradient('grad__fl-standard-knob__soft-shadow', 'radial', {cx: 0.5, cy: 0.5, r: 0.5}, {
      '85%':  { color: '#242a2e', opacity: 0.4 },
      '100%': { color: '#242a2e', opacity: 0 },
    });
    const dialSoftShadow = crsvg('circle', { cx: 20, cy: 20, r: 16, fill: 'url(#grad__fl-standard-knob__soft-shadow)' });

    const dialHardShadow = crsvg('ellipse', { cx: 20, cy: 22, rx: 14, ry: 14.5, fill: '#242a2e', opacity: 0.15 });

    defineSvgGradient('grad__fl-standard-knob__dial-base', 'linear', {x1:0, y1:0, x2:0, y2:1}, {
      '0%': '#52595f',
      '100%': '#2b3238',
    });
    const dialBase = crsvg('circle',
      {
        cx: 20,
        cy: 20,
        r: 14,
        fill: 'url(#grad__fl-standard-knob__dial-base)',
        stroke: '#242a2e',
        'stroke-width': 1.5,
      }
    );

    defineSvgGradient('grad__fl-standard-knob__dial-highlight', 'linear', {x1:0, y1:0, x2:0, y2:1}, {
      '0%':   { color: '#70777d', opacity: 1 },
      '40%':  { color: '#70777d', opacity: 0 },
      '55%':  { color: '#70777d', opacity: 0 },
      '100%': { color: '#70777d', opacity: 0.3 },
    });
    const dialhighlightStroke = crsvg('circle',
      {
        cx: 20,
        cy: 20,
        r: 13,
        fill: 'transparent',
        stroke: 'url(#grad__fl-standard-knob__dial-highlight)',
        'stroke-width': 1.5,
      }
    );

    const dialHighlight = crsvg('circle',
      {
        class: styles.flStandardKnobDialHighlight,
        cx: 20,
        cy: 20,
        r: 14,
        fill: '#ffffff',
      }
    );

    this.indicatorDot = !showIndicatorDot ? null : crsvg('circle',
      {
        cx: 20,
        cy: 30,
        r: 1.5,
        class: styles.flStandardKnobIndicatorDot,
        fill: color,
        'data-precision-inputs-role': 'indicator-dot'
      }
    );

    // combine dial
    [
      dialSoftShadow,
      dialHardShadow,
      dialBase,
      dialhighlightStroke,
      dialHighlight,
      this.indicatorDot,
    ].filter(Boolean).forEach(dial.appendChild.bind(dial));

    // combine all
    [
      focusIndicator,
      indicatorRingBg,
      this.indicatorRing,
      dial,
    ].forEach(svg.appendChild.bind(svg));

    // variables needed for update method
    this.r = 18 - 0.5; // ring BG radius - half stroke width

    return svg;
  }

  update(norm) {
    const theta = Math.PI*2*norm + 0.5*Math.PI;
    const endX = this.r*Math.cos(theta) + 20;
    const endY = this.r*Math.sin(theta) + 20;
    // using 2 arcs rather than flags since one arc collapses if it gets near 360deg
    switch (this.indicatorRingType) {
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
    if (this.indicatorDot) {
      this.indicatorDot.style[this.transformProperty] = `rotate(${360*norm}deg)`;
    }
  }
}
