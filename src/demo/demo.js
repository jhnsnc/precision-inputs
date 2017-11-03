require('./demo.scss');

import FLStandardKnob from '../fl-standard-knob';
import { getTransformProperty, debounce } from '../utils/ui';

// Demo Setup - Envelope Visualization

var visualizer = document.querySelector('.fl-envelope');

// Setup Knobs - Envelope

var envelopeKnobStartPositions = [0, 40, 75, 85, 20, 55];
var envelopeKnobs = [...visualizer.querySelectorAll('.fl-demo-knob.envelope-knob')];
var envelopeKnobs = envelopeKnobs.map((el, idx) => new FLStandardKnob(el, {
  min: 0,
  max: 100,
  initial: envelopeKnobStartPositions[idx],
}));

// Setup Knobs - Tension

var tensionKnobStartPositions = [0, 0, -80];
var tensionKnobs = [...visualizer.querySelectorAll('.fl-demo-knob.tension-knob')];
var tensionKnobs = tensionKnobs.map((el, idx) => new FLStandardKnob(el, {
  indicatorDot: false,
  indicatorRingType: 'split',
  min: -100,
  max: 100,
  initial: tensionKnobStartPositions[idx],
}));

// Setup Envelope Visualization

const container = document.querySelector('.envelope-visualizer');

var flEnvelopeVisualizer = {
  container: container,
  shape: container.querySelector('.envelope-shape'),
  delay: container.querySelector('.delay'),
  attack: container.querySelector('.attack'),
  hold: container.querySelector('.hold'),
  decay: container.querySelector('.decay'),
  release: container.querySelector('.release'),
};
var updateVisualization = debounce(function(evt) {
  var maxPtSeparation = 75;
  var ptDelay = (maxPtSeparation * envelopeKnobs[0].value / 100);
  var ptAttack = ptDelay + (maxPtSeparation * envelopeKnobs[1].value / 100);
  var ptHold = ptAttack + (maxPtSeparation * envelopeKnobs[2].value / 100);
  var ptDecay = ptHold + (maxPtSeparation * envelopeKnobs[3].value / 100) * (100 - envelopeKnobs[4].value) / 100;
  var ptSustain = 100 - envelopeKnobs[4].value; // y value
  var ptRelease = ptDecay + (maxPtSeparation * envelopeKnobs[5].value / 100);
  // TODO: better tension visualization
  var tnAttack = (ptAttack - ptDelay) * tensionKnobs[0].value / 100;
  var tnDecay = (ptDecay - ptHold) * tensionKnobs[1].value / 100;
  var tnRelease = (ptRelease - ptDecay) * tensionKnobs[2].value / 100;
  flEnvelopeVisualizer.shape.setAttribute('d',
    `M${ptDelay},100`+
    `C${tnAttack<0?ptDelay-tnAttack:ptDelay},100,${tnAttack>0?ptAttack-tnAttack:ptAttack},0,${ptAttack},0`+
    `L${ptHold},0`+
    `C${tnDecay>0?ptHold+tnDecay:ptHold},0,${tnDecay<0?ptDecay+tnDecay:ptDecay},${ptSustain},${ptDecay},${ptSustain}`+
    `C${tnRelease>0?ptDecay+tnRelease:ptDecay},${ptSustain},${tnRelease<0?ptRelease+tnRelease:ptRelease},100,${ptRelease},100`
  );
  flEnvelopeVisualizer.delay.setAttribute('cx', ptDelay);
  flEnvelopeVisualizer.attack.setAttribute('cx', ptAttack);
  flEnvelopeVisualizer.hold.setAttribute('cx', ptHold);
  flEnvelopeVisualizer.decay.setAttribute('cx', ptDecay);
  flEnvelopeVisualizer.decay.setAttribute('cy', ptSustain);
  flEnvelopeVisualizer.release.setAttribute('cx', ptRelease);
}, 10);

envelopeKnobs.concat(tensionKnobs)
  .forEach(knob => { knob.addEventListener('change', updateVisualization); });
updateVisualization();

// Panel - Resizing

var transformProp = getTransformProperty();

var panelElement = document.querySelector('.fl-envelope');
var panel = {
  element: panelElement,
  originalTransform: getComputedStyle(panelElement)[transformProp],
  width: panelElement.getBoundingClientRect().width,
  height: panelElement.getBoundingClientRect().height,
};
if (panel.originalTransform === 'none') {
  panel.originalTransform = '';
}
var resizePanel = () => {
  var pw = (window.innerWidth - 40) / panel.width;
  var ph = (window.innerHeight - 40) / panel.height;
  var size = Math.min(pw, ph);
  if (size > 1.4) {
    size -= 0.4;
  } else if (size > 1) {
    size = Math.min(size, 1);
  }
  panel.element.style[transformProp] = `${panel.originalTransform} scale(${size})`;
};
window.addEventListener('resize', resizePanel);
resizePanel();
