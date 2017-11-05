export const svgNS = 'http://www.w3.org/2000/svg';

function getSvgDefsElement() {
  // return if found
  const defsElement = document.getElementById('precision-inputs-svg-defs');
  if (defsElement) {
    return defsElement;
  }

  // otherwise create it
  const svg = document.createElementNS(svgNS, 'svg');
  const defs = document.createElementNS(svgNS, 'defs');
  defs.id = 'precision-inputs-svg-defs';
  svg.appendChild(defs);
  document.body.appendChild(svg);

  return defs;
}

export function defineSvgGradient(id, type, attributes = {}, colorStops = {}) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return false; }

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
};

export function defineBlurFilter(id, blurAmount, compositeMethod = 'none', padding = null) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return false; }

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
};
