import {
  crsvg,
  defineSvgGradient,
  defineBlurFilter,
  defineDarkenFilter,
  defineMask,
  defineDropshadowFilter,
} from '../utils/svg';

import colors from './fl-colors';

import KnobInput from '../base/knob-input';

import * as styles from './fl-reactive-grip-dial.scss';

let instanceCount = 0;

const easeInSine = n => -Math.cos(n*Math.PI/2) + 1;
const easeOutSine = n => Math.sin(n*Math.PI/2);

const thetaOffset = Math.PI/2;
const x = (r, theta) => 20 + r*Math.cos(thetaOffset + theta);
const y = (r, theta) => 20 + r*Math.sin(thetaOffset + theta);

// options:
//   - color (string, hexcolor) - 'transparent' to disable (default = FL default color)
//   - guideTicks (int) - number of tick marks on the outer guide ring (default = 9)
//   - gripBumps (int) - number of grip bumps that appear when interacting with the dial (default = 5)
//   - gripExtrusion (Number) - the degree to which the grips 'cut' into the dial when the user interacts with it, range (0.0, 1.0) (default = 0.5)
//   - minRotation (Number) - angle of rotation corresponding to the `min` value, relative to pointing straight down (default = pointing to the first guide tick mark)
//   - maxRotation (Number) - angle of rotation corresponding to the `max` value, relative to pointing straight down (default = pointing to the last guide tick mark)
export default class FLReactiveGripDial extends KnobInput {
  constructor(containerElement, options = {}) {
    // make sure containerElement is valid
    if (!containerElement) {
      throw new Error('FLReactiveGripDial constructor must receive a valid container element');
    }

    super(containerElement,
      {
        ...options,
        focusActiveClass: styles.focusActive,
        dragActiveClass: styles.dragActive,
      });

    // options
    const color = typeof options.color !== 'undefined' ? options.color : colors.default.str;
    const guideTicks = typeof options.guideTicks === 'number' ? options.guideTicks : 9;
    this.gripBumps = typeof options.gripBumps === 'number' ? options.gripBumps : 5;
    this.gripExtrusion = typeof options.gripExtrusion === 'number' ? options.gripExtrusion : 0.5;
    this.minRotation = typeof options.minRotation === 'number' ? options.minRotation : (0.5/guideTicks) * 360;
    this.maxRotation = typeof options.maxRotation === 'number' ? options.maxRotation : (1-(0.5/guideTicks)) * 360;

    // construct visual element and attach to DOM
    const visualElement = this.createVisuals(color, guideTicks);
    containerElement.classList.add(styles.flReactiveGripDial);
    containerElement.appendChild(visualElement);

    // morph grip dial shape on hover
    this.mouseX = 0;
    this.mouseY = 0;
    this.hoverTween = {
      rafId: null,
      direction: 1,
      progress: 0.0,
      startTime: 0,
      duration: 600,
    };

    // finalize
    this.setupVisuals(this.update.bind(this), visualElement);

    // event handlers
    this.handleHover = this.handleHover.bind(this);
    this.handleMove = this.handleMove.bind(this);
    this.handleUnhover = this.handleUnhover.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);

    this.addEventListener('mouseover', this.handleHover);
    this.addEventListener('knobdragstart', this.handleDragStart);
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

  handleUnhover() {
    this.stopHoverEffect();
  }

  handleDragStart() {
    this.startHoverEffect();
  }

  handleDragEnd() {
    this.stopHoverEffect();
  }

  startHoverEffect() {
    // add event listeners
    document.body.addEventListener('mousemove', this.handleMove);
    this.addEventListener('mouseout', this.handleUnhover);
    this.addEventListener('knobdragend', this.handleDragEnd);
    // start tween
    if (this.hoverTween.rafId) { // cancel if existing
      window.cancelAnimationFrame(this.hoverTween.rafId);
    }
    this.hoverTween = {
      rafId: window.requestAnimationFrame(this.tickHoverTween.bind(this)),
      direction: 1,
      duration: 300,
      startProgress: this.hoverTween.progress,
    };
  }

  stopHoverEffect() {
    // if a drag is still active or the mouse is still hovering, do not stop effect
    const dims = this._input.getBoundingClientRect();
    const isHovering = this.mouseX >= dims.left && this.mouseX <= dims.right && this.mouseY >= dims.top && this.mouseY <= dims.bottom;
    if (isHovering || this._activeDrag) {
      return false;
    }

    // remove event listeners
    document.body.removeEventListener('mousemove', this.handleMove);
    this.removeEventListener('mouseout', this.handleUnhover);
    this.removeEventListener('knobdragend', this.handleDragEnd);

    // end tween
    if (this.hoverTween.rafId) { // cancel if existing
      window.cancelAnimationFrame(this.hoverTween.rafId);
    }
    this.hoverTween = {
      rafId: window.requestAnimationFrame(this.tickHoverTween.bind(this)),
      direction: -1,
      duration: 600,
      startProgress: this.hoverTween.progress,
    };
  }

  tickHoverTween(currentTime) {
    if (!this.hoverTween.startTime) {
      this.hoverTween.startTime = currentTime;
    }
    this.hoverTween.progress = (currentTime - this.hoverTween.startTime) / this.hoverTween.duration;

    if (this.hoverTween.direction > 0) {
      // advance towards 1.0
      this.hoverTween.progress *= 1 - this.hoverTween.startProgress;
      this.hoverTween.progress += this.hoverTween.startProgress;
      if (this.hoverTween.progress < 1.0) {
        // continue
        this.morphGripShape( easeOutSine(this.hoverTween.progress) );
        this.hoverTween.rafId = window.requestAnimationFrame(this.tickHoverTween.bind(this));
      } else {
        // done
        this.hoverTween.progress = 1.0;
        this.morphGripShape( 1.0 );
        this.hoverTween.rafId = null;
      }
    } else {
      // revert towards 0.0
      this.hoverTween.progress *= this.hoverTween.startProgress;
      this.hoverTween.progress = this.hoverTween.startProgress - this.hoverTween.progress;
      if (this.hoverTween.progress > 0.0) {
        // continue
        this.morphGripShape( easeInSine(this.hoverTween.progress) );
        this.hoverTween.rafId = window.requestAnimationFrame(this.tickHoverTween.bind(this));
      } else {
        // done
        this.hoverTween.progress = 0.0;
        this.morphGripShape( 0.0 );
        this.hoverTween.rafId = null;
      }
    }
  }

  morphGripShape(progress) {
    const evenSpacing = Math.PI / this.gripBumps;
    const arcSpan = (2 - progress) * evenSpacing;
    const bumpSpan = progress * evenSpacing;
    const bumpRadius = 13 / (18 * this.gripExtrusion + 1) * this.gripBumps;

    // write path data
    let gripPathData = `M${x(13,-arcSpan/2)},${y(13,-arcSpan/2)}`;
    for(let i = 0; i < this.gripBumps; i += 1) {
      const arcAfter = (i*2)*evenSpacing + (arcSpan/2);
      const bumpAfter = (i*2+1)*evenSpacing + (bumpSpan/2);
      gripPathData += `A-13,13,0,0,1,${x(13,arcAfter)},${y(13,arcAfter)}`;
      gripPathData += `A-${bumpRadius},${bumpRadius},0,0,0,${x(13,bumpAfter)},${y(13,bumpAfter)}`;
    }
    gripPathData += 'Z';

    // update shapes
    this.gripMaskPath.setAttribute('d', gripPathData);
    this.gripOutline.setAttribute('d', gripPathData);
  }

  createVisuals(color, guideTicks) {
    const svg = crsvg('svg', { class: styles.flReactiveGripDialSvg, viewBox: '0 0 40 40' });

    // container for defs specific to this dial instance
    const defs = crsvg('defs');
    const initialGripPath = 'M20,33A13,13,0,0,1,20,7A-13,13,0,0,1,20,33Z';
    const gripMask = crsvg('mask',
      { id: `mask__fl-reactive-grip__grip-outline--${instanceCount++}` },
      [
        this.gripMaskPath = crsvg('path',
        {
          d: initialGripPath,
          class: styles.flReactiveGripDialGripMaskPath,
          fill: '#ffffff',
        })
      ]
    );
    defs.appendChild(gripMask);

    // guides
    const minTheta = this.minRotation * Math.PI / 180;
    const maxTheta = this.maxRotation * Math.PI / 180;
    const thetaDelta = maxTheta - minTheta;
    const guides = crsvg('g',
      [
        crsvg('path',
          {
            d: `M${x(16,minTheta)},${y(16,minTheta)}A16,16,0,0,1,20,4A-16,16,0,0,1,${x(16,maxTheta)},${y(16,maxTheta)}`,
            class: styles.flReactiveGripDialFocusIndicator,
            fill: 'transparent',
            stroke: color,
            'stroke-width': 3,
            'stroke-linecap': 'round',
            filter: defineBlurFilter(`filter__${styles.flReactiveGripDialFocusIndicator}`, 1.5, 'none', 0.2),
          }
        ),
        crsvg('path',
          {
            d: `M${x(16,minTheta)},${y(16,minTheta)}A16,16,0,0,1,20,4A-16,16,0,0,1,${x(16,maxTheta)},${y(16,maxTheta)}`,
            class: styles.flReactiveGripDialGuideRing,
            fill: 'transparent',
            stroke: '#32383c',
            'stroke-width': 3,
            'stroke-linecap': 'round',
          }
        ),
      ]
    );
    for (let i = 0; i < guideTicks; i += 1) {
      let theta = minTheta + i * thetaDelta / (guideTicks - 1);
      guides.appendChild(
        crsvg('line', { x1: x(19.5,theta), y1: y(19.5,theta), x2: x(14.5,theta), y2: y(14.5,theta), stroke: '#23292d' })
      );
    }

    // dial grip
    const grip = crsvg('g',
      {
        filter: defineDropshadowFilter('filter__fl-reactive-grip-dial__drop-shadow', 0x23292d, 0.3, 0, 2, 0.3),
      },
      [
        crsvg('rect',
          {
            x: 6, y: 6,
            width: 28, height: 28,
            fill: defineSvgGradient('grad__fl-reactive-grip-dial__grip-fill', 'radial', {cx: 0.5, cy: -0.2, r: 1.2, fx: 0.5, fy: -0.2}, {
              '0%': '#8b9499',
              '70%': '#10191e',
              '100%': '#2b3439',
            }),
            mask: `url(#${gripMask.id})`,
          }
        ),
        this.gripOutline = crsvg('path',
          {
            d: initialGripPath,
            class: styles.flReactiveGripDialGripOutline,
            fill: 'transparent',
            stroke: '#23292d',
            'stroke-width': 0.5,
          }
        ),
        this.indicatorDot = crsvg('circle',
          {
            cx: x(10.5,0), cy: y(10.5,0), r: 1,
            class: styles.flReactiveGripDialIndicatorDot,
            fill: color,
          }
        ),
      ]
    );

    // dial top
    const chrome = crsvg('g', { class: styles.flReactiveGripDialChrome });
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
    const chromeBase = crsvg('g',
      {
        mask: defineMask('mask__fl-reactive-grip__chrome-base', [ crsvg('circle', { cx: 20, cy: 20, r: 8, fill: '#ffffff' }) ]),
        transform: 'rotate(-25 20 20)'
      },
      [
        crsvg('g', { filter: blurMain },
          [
            crsvg('rect', { x: 12, y: 12, width: 16, height: 16, fill: '#383d3f' }),
            crsvg('rect', { x: 12, y: 12, width: 8, height: 16, fill: chromeGradientA }),
            crsvg('rect', { x: 20, y: 12, width: 8, height: 16, fill: chromeGradientB }),
            crsvg('rect', { x: 12, y: 12, width: 16, height: 8, fill: chromeGradientC }),
            crsvg('rect', { x: 12, y: 20, width: 16, height: 8, fill: chromeGradientD }),
            crsvg('line', { x1: 12, y1: 28, x2: 19, y2: 21, stroke: '#ffffff', 'stroke-opacity': 0.8 }),
            crsvg('line', { x1: 21, y1: 19, x2: 28, y2: 12, stroke: '#ffffff', 'stroke-opacity': 0.8 }),
          ]
        ),
        crsvg('line', { x1: 12, y1: 28, x2: 19.5, y2: 20.5, stroke: '#ffffff', 'stroke-opacity': 0.5, 'stroke-width': 0.75, filter: blurHighlight }),
        crsvg('line', { x1: 20.5, y1: 19.5, x2: 28, y2: 12, stroke: '#ffffff', 'stroke-opacity': 0.5, 'stroke-width': 0.75, filter: blurHighlight }),
      ]
    );

    // dial top - chrome ridges
    const chromeRidgesMaskItems = [];
    for (let i = 1; i < 11; i += 1) {
      chromeRidgesMaskItems.push( crsvg('circle', { cx: 20, cy: 20, r: i*7.5/10, fill: 'transparent', stroke: '#ffffff', 'stroke-width': 0.5*7.5/10 }) );
    }
    const chromeRidges = crsvg('g',
      {
        mask: defineMask('mask__fl-reactive-grip__chrome-ridges', chromeRidgesMaskItems),
        transform: 'rotate(-19 20 20)',
        filter: darken
      },
      [
        crsvg('g', { filter: blurMain },
          [
            crsvg('rect', { x: 12, y: 12, width: 16, height: 16, fill: '#383d3f' }),
            crsvg('rect', { x: 12, y: 12, width: 8, height: 16, fill: chromeGradientA }),
            crsvg('rect', { x: 20, y: 12, width: 8, height: 16, fill: chromeGradientB }),
            crsvg('rect', { x: 12, y: 12, width: 16, height: 8, fill: chromeGradientC }),
            crsvg('rect', { x: 12, y: 20, width: 16, height: 8, fill: chromeGradientD }),
            crsvg('line', { x1: 12, y1: 28, x2: 19, y2: 21, stroke: '#ffffff', 'stroke-opacity': 0.8 }),
            crsvg('line', { x1: 21, y1: 19, x2: 28, y2: 12, stroke: '#ffffff', 'stroke-opacity': 0.8 }),
          ]
        ),
        crsvg('line', { x1: 12, y1: 28, x2: 19.5, y2: 20.5, stroke: '#ffffff', 'stroke-opacity': 0.5, 'stroke-width': 0.75, filter: blurHighlight }),
        crsvg('line', { x1: 20.5, y1: 19.5, x2: 28, y2: 12, stroke: '#ffffff', 'stroke-opacity': 0.5, 'stroke-width': 0.75, filter: blurHighlight }),
      ]
    );

    // dial top - combine
    const chromeOutline = crsvg('circle',
    {
      cx: 20, cy: 20, r: 8,
      fill: 'transparent',
      stroke: '#23292d',
    });
    const chromeHighlight = crsvg('circle',
    {
      cx: 20, cy: 20, r: 7.5,
      fill: 'transparent',
      stroke: '#70777d',
      'stroke-opacity': 0.6,
    });

    // combine dial
    [
      chromeBase,
      chromeRidges,
      chromeOutline,
      chromeHighlight,
    ].forEach(chrome.appendChild.bind(chrome));

    // combine all
    [
      defs,
      guides,
      grip,
      chrome,
    ].forEach(svg.appendChild.bind(svg));

    return svg;
  }

  update(norm) {
    const newRotation = (1 - norm) * this.minRotation + norm * this.maxRotation;
    this.gripMaskPath.style[this.transformProperty] = `rotate(${newRotation}deg)`;
    this.gripOutline.style[this.transformProperty] = `rotate(${newRotation}deg)`;
    this.indicatorDot.style[this.transformProperty] = `rotate(${newRotation}deg)`;
  }
}
