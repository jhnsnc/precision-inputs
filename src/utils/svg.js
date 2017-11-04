export const svgNS = 'http://www.w3.org/2000/svg';

function getSvgDefsElement() {
  // return if found
  const defsElement = document.getElementById('knob-input-svg-defs');
  if (defsElement) {
    return defsElement;
  }

  // otherwise create it
  const svg = document.createElementNS(svgNS, 'svg');
  const defs = document.createElementNS(svgNS, 'defs');
  defs.id = 'knob-input-svg-defs';
  svg.appendChild(defs);
  document.body.appendChild(svg);

  return defs;
}

function makeColorStops(colorStops = {}) {
  const results = [];
  let stopEl;
  for (let offset in colorStops) {
    if  (colorStops.hasOwnProperty(offset)) {
      stopEl = document.createElementNS(svgNS, 'stop');
      // set offset
      if (!isNaN(offset)) { //number
        stopEl.setAttribute('offset', offset + '%');
      } else if (offset[offset.length - 1] === '%') { // percent
        stopEl.setAttribute('offset', offset);
      } else {
        continue;
      }
      // set color/opacity
      if (typeof colorStops[offset] === 'string') {
        // color string
        stopEl.setAttribute('stop-color', colorStops[offset]);
      } else {
        // color stop object
        if (typeof colorStops[offset].color === 'string')
          stopEl.setAttribute('stop-color', colorStops[offset].color);
        if (typeof colorStops[offset].opacity !== 'undefined')
          stopEl.setAttribute('stop-opacity', colorStops[offset].opacity);
      }
      results.push(stopEl);
    }
  }
  return results;
}

export function defineSvgLinearGradient(id, sizing = {}, colorStops = {}) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return false; }

  // create element, set sizing
  const linGrad = document.createElementNS(svgNS, 'linearGradient');
  linGrad.id = id;
  if (typeof sizing.x1 !== 'undefined')
    linGrad.setAttribute('x1', sizing.x1);
  if (typeof sizing.y1 !== 'undefined')
    linGrad.setAttribute('y1', sizing.y1);
  if (typeof sizing.x2 !== 'undefined')
    linGrad.setAttribute('x2', sizing.x2);
  if (typeof sizing.y2 !== 'undefined')
    linGrad.setAttribute('y2', sizing.y2);

  // create color stops
  makeColorStops(colorStops).forEach(stop => linGrad.appendChild(stop));

  // add to DOM
  const defs = getSvgDefsElement();
  defs.appendChild(linGrad);
};

export function defineSvgRadialGradient(id, sizing = {}, colorStops = {}) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return false; }

  // create element, set sizing
  const radGrad = document.createElementNS(svgNS, 'radialGradient');
  radGrad.id = id;
  if (typeof sizing.cx !== 'undefined')
    radGrad.setAttribute('cx', sizing.cx);
  if (typeof sizing.cy !== 'undefined')
    radGrad.setAttribute('cy', sizing.cy);
  if (typeof sizing.r !== 'undefined')
    radGrad.setAttribute('r', sizing.r);

  // create color stops
  makeColorStops(colorStops).forEach(stop => radGrad.appendChild(stop));

  // add to DOM
  const defs = getSvgDefsElement();
  defs.appendChild(radGrad);
};

export function defineBlurFilter(id, blurAmount, compositeMethod = 'none') {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return false; }

  // create filter
  const filter = document.createElementNS(svgNS, 'filter');
  filter.id = id;

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
  const defs = getSvgDefsElement();
  defs.appendChild(filter);
};
