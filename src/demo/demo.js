require('./demo.scss');

import KnobInput from '../knob-input';
import FLStandardKnob from '../fl-standard-knob';
import { getTransformProperty, debounce } from '../utils/ui';

var visualizerA = document.querySelector('.fl-envelope--a');

// Demo Setup - Knobs

var envelopeKnobStartPositions = [0, 40, 75, 85, 20, 55];
var envelopeKnobs = [...visualizerA.querySelectorAll('.fl-envelope__knob.envelope-knob')];
var envelopeKnobs = envelopeKnobs.map((el, idx) => new KnobInput(el, el.querySelector('.knob-svg'), {
  visualContext: function() {
    this.indicatorRing = this.element.querySelector('.indicator-ring');
    var ringStyle = getComputedStyle(this.element.querySelector('.indicator-ring-bg'));
    this.r = parseFloat(ringStyle.r) - (parseFloat(ringStyle.strokeWidth) / 2);
    this.indicatorDot = this.element.querySelector('.indicator-dot');
    this.indicatorDot.style[`${this.transformProperty}Origin`] = '20px 20px';
  },
  updateVisuals: function(norm) {
    var theta = Math.PI*2*norm + 0.5*Math.PI;
    var endX = this.r*Math.cos(theta) + 20;
    var endY = this.r*Math.sin(theta) + 20;
    // using 2 arcs rather than flags since one arc collapses if it gets near 360deg
    this.indicatorRing.setAttribute('d',`M20,20l0,${this.r}${norm> 0.5?`A${this.r},${this.r},0,0,1,20,${20-this.r}`:''}A-${this.r},${this.r},0,0,1,${endX},${endY}Z`);
    this.indicatorDot.style[this.transformProperty] = `rotate(${360*norm}deg)`;
  },
  min: 0,
  max: 100,
  initial: envelopeKnobStartPositions[idx],
}));

var tensionKnobStartPositions = [0, 0, -80];
var tensionKnobs = [...visualizerA.querySelectorAll('.fl-envelope__knob.tension-knob')];
var tensionKnobs = tensionKnobs.map((el, idx) => new KnobInput(el, el.querySelector('.knob-svg'), {
  visualContext: function() {
    this.indicatorRing = this.element.querySelector('.indicator-ring');
    var ringStyle = getComputedStyle(this.element.querySelector('.indicator-ring-bg'));
    this.r = parseFloat(ringStyle.r) - (parseFloat(ringStyle.strokeWidth) / 2);
  },
  updateVisuals: function(norm) {
    var theta = Math.PI*2*norm + 0.5*Math.PI;
    var endX = this.r*Math.cos(theta) + 20;
    var endY = this.r*Math.sin(theta) + 20;
    this.indicatorRing.setAttribute('d',`M20,20l0,-${this.r}A${this.r},${this.r},0,0,${norm<0.5?0:1},${endX},${endY}Z`);
  },
  min: -100,
  max: 100,
  initial: tensionKnobStartPositions[idx],
}));

// Demo Setup - Envelope Visualization

var container = visualizerA.querySelector('.envelope-visualizer');
var envelopeVisualizer = {
  container: container,
  shape: container.querySelector('.envelope-shape'),
  delay: container.querySelector('.delay'),
  attack: container.querySelector('.attack'),
  hold: container.querySelector('.hold'),
  decay: container.querySelector('.decay'),
  release: container.querySelector('.release'),
};

function setupEnvelopeVisualization(envVis, envelopeKnobs, tensionKnobs) {
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
    envVis.shape.setAttribute('d',
      `M${ptDelay},100`+
      `C${tnAttack<0?ptDelay-tnAttack:ptDelay},100,${tnAttack>0?ptAttack-tnAttack:ptAttack},0,${ptAttack},0`+
      `L${ptHold},0`+
      `C${tnDecay>0?ptHold+tnDecay:ptHold},0,${tnDecay<0?ptDecay+tnDecay:ptDecay},${ptSustain},${ptDecay},${ptSustain}`+
      `C${tnRelease>0?ptDecay+tnRelease:ptDecay},${ptSustain},${tnRelease<0?ptRelease+tnRelease:ptRelease},100,${ptRelease},100`
    );
    envVis.delay.setAttribute('cx', ptDelay);
    envVis.attack.setAttribute('cx', ptAttack);
    envVis.hold.setAttribute('cx', ptHold);
    envVis.decay.setAttribute('cx', ptDecay);
    envVis.decay.setAttribute('cy', ptSustain);
    envVis.release.setAttribute('cx', ptRelease);
  }, 10);

  envelopeKnobs.concat(tensionKnobs)
    .forEach(knob => { knob.addEventListener('change', updateVisualization); });
  updateVisualization();
}
setupEnvelopeVisualization(envelopeVisualizer, envelopeKnobs, tensionKnobs);

// Panel - Resizing

// var transformProp = getTransformProperty();
//
// var panelElement = document.querySelector('.fl-envelope');
// var panel = {
//   element: panelElement,
//   originalTransform: getComputedStyle(panelElement)[transformProp],
//   width: panelElement.getBoundingClientRect().width,
//   height: panelElement.getBoundingClientRect().height,
// };
// var resizePanel = () => {
//   var pw = (window.innerWidth - 40) / panel.width;
//   var ph = (window.innerHeight - 40) / panel.height;
//   var size = Math.min(pw, ph);
//   if (size > 1.4) {
//     size -= 0.4;
//   } else if (size > 1) {
//     size = Math.min(size, 1);
//   }
//   panel.element.style[transformProp] = `${panel.originalTransform} scale(${size})`;
// };
// window.addEventListener('resize', resizePanel);
// resizePanel();

var visualizerB = document.querySelector('.fl-envelope--b');

var envelopeKnobStartPositions = [0, 40, 75, 85, 20, 55];
var flEnvelopeKnobs = [...visualizerB.querySelectorAll('.fl-demo-knob.envelope-knob')];
var flEnvelopeKnobs = flEnvelopeKnobs.map((el, idx) => new FLStandardKnob(el, {
  min: 0,
  max: 100,
  initial: envelopeKnobStartPositions[idx],
}));

var tensionKnobStartPositions = [0, 0, -80];
var flTensionKnobs = [...visualizerB.querySelectorAll('.fl-demo-knob.tension-knob')];
var flTensionKnobs = flTensionKnobs.map((el, idx) => new FLStandardKnob(el, {
  indicatorDot: false,
  indicatorRingType: 'split',
  min: -100,
  max: 100,
  initial: tensionKnobStartPositions[idx],
}));

var flVisContainer = visualizerB.querySelector('.envelope-visualizer');
var flEnvelopeVisualizer = {
  container: flVisContainer,
  shape: flVisContainer.querySelector('.envelope-shape'),
  delay: flVisContainer.querySelector('.delay'),
  attack: flVisContainer.querySelector('.attack'),
  hold: flVisContainer.querySelector('.hold'),
  decay: flVisContainer.querySelector('.decay'),
  release: flVisContainer.querySelector('.release'),
};
setupEnvelopeVisualization(flEnvelopeVisualizer, flEnvelopeKnobs, flTensionKnobs);
