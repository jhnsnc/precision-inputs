require('./demo-fl-envelope.scss');

import { debounce } from '../utils/ui';
import { numToHexstring, mixColors } from '../utils/color';

import FLStandardKnob from '../fl-controls/fl-standard-knob';

import FLColors from '../fl-controls/fl-colors';

export default function setupFLEnvelope() {
  // Demo Setup - Envelope Visualization

  var visualizer = document.querySelector('.fl-envelope');

  // Setup Knobs - Envelope

  var envelopeKnobStartPositions = [0, 40, 75, 85, 20, 55];
  var envelopeKnobs = Array.prototype.slice.apply(visualizer.querySelectorAll('.fl-demo-knob.envelope-knob'));
  var envelopeKnobs = envelopeKnobs.map((el, idx) => new FLStandardKnob(el, {
    min: 0,
    max: 100,
    initial: envelopeKnobStartPositions[idx],
  }));

  // Setup Knobs - Tension

  var tensionKnobStartPositions = [0, 0, -80];
  var tensionKnobs = Array.prototype.slice.apply(visualizer.querySelectorAll('.fl-demo-knob.tension-knob'));
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
  flEnvelopeVisualizer.shape.setAttribute('stroke', FLColors.default.str);
  flEnvelopeVisualizer.shape.setAttribute('fill', 'transparent');
  flEnvelopeVisualizer.delay.setAttribute('stroke', FLColors.default.str);
  flEnvelopeVisualizer.delay.setAttribute('fill', numToHexstring(mixColors(FLColors.default.val, 0x000000, 0.6)) );
  flEnvelopeVisualizer.attack.setAttribute('stroke', FLColors.default.str);
  flEnvelopeVisualizer.attack.setAttribute('fill', numToHexstring(mixColors(FLColors.default.val, 0x000000, 0.6)) );
  flEnvelopeVisualizer.hold.setAttribute('stroke', FLColors.default.str);
  flEnvelopeVisualizer.hold.setAttribute('fill', numToHexstring(mixColors(FLColors.default.val, 0x000000, 0.6)) );
  flEnvelopeVisualizer.decay.setAttribute('stroke', FLColors.default.str);
  flEnvelopeVisualizer.decay.setAttribute('fill', numToHexstring(mixColors(FLColors.default.val, 0x000000, 0.6)) );
  flEnvelopeVisualizer.release.setAttribute('stroke', FLColors.default.str);
  flEnvelopeVisualizer.release.setAttribute('fill', numToHexstring(mixColors(FLColors.default.val, 0x000000, 0.6)) );
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
}
