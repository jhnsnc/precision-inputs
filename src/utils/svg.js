export const svgNS = 'http://www.w3.org/2000/svg';

// Utils

const camelCaseToHyphenatedString = str => str.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}` );

function applyElementAttributes(el, attributes = {}, transparentFill = true) {
  // default fill to transparent rather than default SVG fill (black)
  if (transparentFill && typeof attributes.fill === 'undefined') {
    el.setAttribute('fill', 'transparent');
  }

  // apply all attributes
  for (let attr in attributes)
    if (attributes.hasOwnProperty(attr)) {
      if (attr === 'id') {
        // id
        el.id = attributes[attr];
      } else if (attr === 'classes') {
        // class
        if (Array.isArray(attributes[attr])) {
          el.classList.add.apply(el.classList, attributes[attr]);
        } else {
          el.classList.add(attributes[attr]);
        }
      } else {
        // other
        el.setAttribute(camelCaseToHyphenatedString(attr), attributes[attr]);
      }
    }
}

// Global Defs - Filters/Gradients/etc

function getSvgDefsElement() {
  // return if found
  const defsElement = document.getElementById('precision-inputs-svg-defs');
  if (defsElement) {
    return defsElement;
  }

  // otherwise create it
  const svg = document.createElementNS(svgNS, 'svg');
  svg.style.position = 'absolute';
  svg.style.left = 0;
  svg.style.top = 0;
  svg.style.width = 0;
  svg.style.height = 0;
  svg.style.opacity = 0;
  const defs = document.createElementNS(svgNS, 'defs');
  defs.id = 'precision-inputs-svg-defs';
  svg.appendChild(defs);
  document.body.appendChild(svg);

  return defs;
}

// TODO: incorporate new util functions (?)
export function defineSvgGradient(id, type, attributes = {}, colorStops = {}) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // error checking
  if (type !== 'linear' && type !== 'radial') {
    throw new Error(`Unknown SVG Gradient type: ${type}`);
  }

  // create element, set attributes
  const gradientElement = document.createElementNS(svgNS, type === 'linear' ? 'linearGradient' : 'radialGradient');
  gradientElement.id = id;
  for (let attr in attributes)
    if (attributes.hasOwnProperty(attr))
      gradientElement.setAttribute(attr, attributes[attr]);

  // create color stops
  let stopElement;
  for (let offset in colorStops)
    if  (colorStops.hasOwnProperty(offset)) {
      stopElement = document.createElementNS(svgNS, 'stop');
      // set offset
      if (!isNaN(offset)) { //number
        stopElement.setAttribute('offset', offset + '%');
      } else if (offset[offset.length - 1] === '%') { // percent
        stopElement.setAttribute('offset', offset);
      } else {
        continue;
      }
      // set color/opacity
      if (typeof colorStops[offset] === 'string') {
        // simple string (color only)
        stopElement.setAttribute('stop-color', colorStops[offset]);
      } else {
        // object
        if (typeof colorStops[offset].color === 'string')
          stopElement.setAttribute('stop-color', colorStops[offset].color);
        if (typeof colorStops[offset].opacity !== 'undefined')
          stopElement.setAttribute('stop-opacity', colorStops[offset].opacity);
      }
      gradientElement.appendChild(stopElement);
    }

  // add to DOM
  getSvgDefsElement().appendChild(gradientElement);

  return `url(#${id})`;
};

// TODO: incorporate new util functions (?)
export function defineBlurFilter(id, blurAmount, compositeMethod = 'none', padding = null) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // create filter
  const filter = document.createElementNS(svgNS, 'filter');
  filter.id = id;

  // add padding
  if (typeof padding === 'number') {
    filter.setAttribute('x', -1 * padding);
    filter.setAttribute('y', -1 * padding);
    filter.setAttribute('width', 1 + 2 * padding);
    filter.setAttribute('height', 1 + 2 * padding);
  }

  // create gaussian blur
  const blur = document.createElementNS(svgNS, 'feGaussianBlur');
  blur.setAttribute('in', 'SourceGraphic');
  if (compositeMethod !== 'none') {
    blur.setAttribute('result', 'blur');
  }
  blur.setAttribute('stdDeviation', blurAmount);
  filter.appendChild(blur);

  // create compositor
  if (compositeMethod !== 'none') {
    const compositor = document.createElementNS(svgNS, 'feComposite');
    compositor.setAttribute('in', 'blur');
    compositor.setAttribute('in2', 'SourceGraphic');
    compositor.setAttribute('operator', compositeMethod);
    filter.appendChild(compositor);
  }

  // add to DOM
  getSvgDefsElement().appendChild(filter);

  return `url(#${id})`;
};

// TODO: incorporate new util functions (?)
export function defineDarkenFilter(id, brightnessCoeff, brightnessOffset, padding = null) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // create filter
  const filter = document.createElementNS(svgNS, 'filter');
  filter.id = id;

  // add padding
  if (typeof padding === 'number') {
    filter.setAttribute('x', -1 * padding);
    filter.setAttribute('y', -1 * padding);
    filter.setAttribute('width', 1 + 2 * padding);
    filter.setAttribute('height', 1 + 2 * padding);
  }

  // create color matrix
  const colorMatrix = document.createElementNS(svgNS, 'feColorMatrix');
  colorMatrix.setAttribute('in', 'SourceGraphic');
  colorMatrix.setAttribute('type', 'matrix');
  colorMatrix.setAttribute('values', `${brightnessCoeff} 0 0 0 ${brightnessOffset}  0 ${brightnessCoeff} 0 0 ${brightnessOffset}  0 0 ${brightnessCoeff} 0 ${brightnessOffset}  0 0 0 1 0`);
  filter.appendChild(colorMatrix);

  // add to DOM
  getSvgDefsElement().appendChild(filter);

  return `url(#${id})`;
};

export function defineMask(id, children = []) {
  // exit early if mask already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // create element, set attributes
  const maskElement = document.createElementNS(svgNS, 'mask');
  maskElement.id = id;

  // add child elements
  children.forEach( el => maskElement.appendChild(el) );

  // add to DOM
  getSvgDefsElement().appendChild(maskElement);

  return `url(#${id})`;
};

// Elements - g, rect, circle, line, path, etc.

export function createGroup(attributes = {}) {
  // create element
  const g = document.createElementNS(svgNS, 'g');

  // apply attributes
  applyElementAttributes(g, attributes, false);

  return g;
}

export function createRectangle(x, y, w, h, attributes = {}) {
  // basic error checking
  if (typeof x === 'undefined' || typeof y === 'undefined' || typeof w === 'undefined' || typeof h === 'undefined') {
    throw new Error('Missing required parameters for creating SVG rectangle.');
  }

  // create element, set basic attributes
  const rect = document.createElementNS(svgNS, 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);

  // apply attributes
  applyElementAttributes(rect, attributes);

  return rect;
}

export function createCircle(x, y, r, attributes = {}) {
  // basic error checking
  if (typeof x === 'undefined' || typeof y === 'undefined' || typeof r === 'undefined') {
    throw new Error('Missing required parameters for creating SVG circle.');
  }

  // create element, set basic attributes
  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
  circle.setAttribute('r', r);

  // apply attributes
  applyElementAttributes(circle, attributes);

  return circle;
}

export function createLine(x1, y1, x2, y2, attributes = {}) {
  // basic error checking
  if (typeof x1 === 'undefined' || typeof y1 === 'undefined' || typeof x2 === 'undefined' || typeof y2 === 'undefined') {
    throw new Error('Missing required parameters for creating SVG line.');
  }

  // create element, set basic attributes
  const line = document.createElementNS(svgNS, 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);

  // apply attributes
  applyElementAttributes(line, attributes, false);

  return line;
}

export function createPath(d, attributes = {}) {
  // basic error checking
  if (typeof d === 'undefined') {
    throw new Error('Missing required parameters for creating SVG path.');
  }

  // create element, set basic attributes
  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('d', d);

  // apply attributes
  applyElementAttributes(path, attributes);

  return path;
}

