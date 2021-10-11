import crelns from 'crelns';

const svgNS = 'http://www.w3.org/2000/svg';

export const crsvg = crelns.bind(null, svgNS);


// Utils

function getPadding(padding) {
  if (typeof padding === 'number') {
    return { x: -1 * padding, y: -1 * padding, width: 1 + 2 * padding, height: 1 + 2 * padding };
  } else {
    // default 0.1
    return { x: -0.1, y: -0.1, width: 1.2, height: 1.2 };
  }
}

// Global Defs - Filters/Gradients/etc

const SVG_DEFS_ID = 'precision-inputs-svg-defs';
let svgDefsElement = null;

function getSvgDefsElement() {
  // return if found
  if (svgDefsElement) { return svgDefsElement; }

  // otherwise create it
  const svg = crsvg('svg',
    [ svgDefsElement = crsvg('defs', { id: SVG_DEFS_ID }) ]
  );
  svg.style.position = 'absolute';
  svg.style.left = 0;
  svg.style.top = 0;
  svg.style.width = 0;
  svg.style.height = 0;
  svg.style.zIndex = -1;
  if (document.body.firstChild) {
    document.body.insertBefore(svg, document.body.firstChild);
  } else {
    document.body.appendChild(svg);
  }

  return svgDefsElement;
}

export function defineSvgGradient(id, type, attributes = {}, colorStops = {}) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return `url(#${id})`; }
  // basic error checking
  if (type !== 'linear' && type !== 'radial') {
    throw new Error(`Unknown SVG Gradient type: ${type}`);
  }

  // create element
  const gradientElement = crsvg(type === 'linear' ? 'linearGradient' : 'radialGradient',
    {
      ...attributes,
      id,
      'color-interpolation': 'sRGB',
    },
    Object.entries(colorStops).map(([key, val]) => {
      // add each color stop
      const offset = typeof key === 'string' ? key : `${key * 100}%`;
      if (typeof val === 'string') {
        return crsvg('stop', { offset, 'stop-color': val });
      } else {
        if (typeof val.opacity !== 'undefined') {
          return crsvg('stop', { offset, 'stop-color': val.color, 'stop-opacity': val.opacity });
        } else {
          return crsvg('stop', { offset, 'stop-color': val.color });
        }
      }
    })
  );

  // add to DOM
  getSvgDefsElement().appendChild(gradientElement);
  return `url(#${id})`;
};

export function defineBlurFilter(id, blurAmount, compositeMethod = 'none', padding = null) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // filter passes
  const filterPasses = [
    crsvg('feGaussianBlur', { in: 'SourceGraphic', result: 'blur', stdDeviation: blurAmount }) // blur
  ];
  if (compositeMethod !== 'none') {
    filterPasses.push(crsvg('feComposite', { in: 'blur', in2: 'SourceGraphic', operator: compositeMethod, })); // composite
  }

  // create filter
  const filter = crsvg('filter', { id, 'color-interpolation-filters': 'sRGB', ...getPadding(padding) }, filterPasses);

  // add to DOM
  getSvgDefsElement().appendChild(filter);
  return `url(#${id})`;
};

export function defineDarkenFilter(id, brightnessCoeff, brightnessOffset, padding = null) {
  // exit early if gradient already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // create filter
  const filter = crsvg('filter', { id, 'color-interpolation-filters': 'sRGB', ...getPadding(padding) },
    [
      // darken
      crsvg('feColorMatrix', {
        in: 'SourceGraphic',
        type: 'matrix',
        values: `${brightnessCoeff} 0 0 0 ${brightnessOffset}  0 ${brightnessCoeff} 0 0 ${brightnessOffset}  0 0 ${brightnessCoeff} 0 ${brightnessOffset}  0 0 0 1 0`,
      })
    ]
  );

  // add to DOM
  getSvgDefsElement().appendChild(filter);
  return `url(#${id})`;
};

export function defineDropshadowFilter(id, color = 0x000000, opacity = 0.6, offsetX = 1, offsetY = 3, padding = null) {
  // exit early if filter already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // create filter
  const filter = crsvg('filter', { id, 'color-interpolation-filters': 'sRGB', ...getPadding(padding) },
    [
      // offset
      crsvg('feOffset', { dx: offsetX, dy: offsetY }),
      // darken
      crsvg('feColorMatrix', {
        result: 'darken',
        type: 'matrix',
        values: `0 0 0 0 ${((color>>16)&0xff)/256}  0 0 0 0 ${((color>>8)&0xff)/256}  0 0 0 0 ${(color&0xff)/256}  0 0 0 ${opacity} 0`,
      }),
      // composite
      crsvg('feComposite', { in: 'SourceGraphic', in2: 'darken', operator: 'over' }),
    ]
  );

  // add to DOM
  getSvgDefsElement().appendChild(filter);
  return `url(#${id})`;
}

export function defineMask(id, children = []) {
  // exit early if mask already exists
  if (document.getElementById(id)) { return `url(#${id})`; }

  // create element, set attributes
  const mask = crsvg('mask', { id }, children);

  // add to DOM
  getSvgDefsElement().appendChild(mask);
  return `url(#${id})`;
};
