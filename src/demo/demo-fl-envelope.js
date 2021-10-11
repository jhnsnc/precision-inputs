import crel from 'crel';
import rafSchd from 'raf-schd';

import { crsvg } from '../utils/svg';
import { colorNumToHexstring, mixColors } from '../utils/color';

import FLStandardKnob from '../fl-controls/fl-standard-knob';
import FLColors from '../fl-controls/fl-colors';

import * as styles from './demo-fl-envelope.scss';

export default function setupFLEnvelope() {
  const { panel, visualizer, envelopeKnobs, tensionKnobs } = createDemoElements();
  document.body.appendChild(panel);

  // setup envelope knobs
  const envelopeKnobStartPositions = {
    delay: 0,
    attack: 40,
    hold: 75,
    decay: 85,
    sustain: 20,
    release: 55
  };
  Object.keys(envelopeKnobs).forEach(type => {
    envelopeKnobs[type] = new FLStandardKnob(envelopeKnobs[type], {
      min: 0,
      max: 100,
      initial: envelopeKnobStartPositions[type],
    });
  });

  // setup tension knobs
  const tensionKnobStartPositions =  {
    attack: 0,
    decay: 0,
    release: -80
  };
  Object.keys(tensionKnobs).forEach(type => {
    tensionKnobs[type] = new FLStandardKnob(tensionKnobs[type], {
      indicatorDot: false,
      indicatorRingType: 'split',
      min: -100,
      max: 100,
      initial: tensionKnobStartPositions[type],
    });
  });

  // setup envelope visualization
  const strokeColor = FLColors.default.str;
  const fillColor = colorNumToHexstring(mixColors(FLColors.default.val, 0x000000, 0.6));
  crsvg(visualizer.shape, { stroke: strokeColor, fill: 'transparent' });
  crsvg(visualizer.delay, { stroke: strokeColor, fill: fillColor });
  crsvg(visualizer.attack, { stroke: strokeColor, fill: fillColor });
  crsvg(visualizer.hold, { stroke: strokeColor, fill: fillColor });
  crsvg(visualizer.decay, { stroke: strokeColor, fill: fillColor });
  crsvg(visualizer.release, { stroke: strokeColor, fill: fillColor });

  const updateVisualization = rafSchd(updateVisualizationDisplay.bind(this, visualizer, envelopeKnobs, tensionKnobs));

  Object.keys(envelopeKnobs).forEach(type => {
    envelopeKnobs[type].addEventListener('change', updateVisualization);
  });
  Object.keys(tensionKnobs).forEach(type => {
    tensionKnobs[type].addEventListener('change', updateVisualization);
  });
  updateVisualization();
}

function updateVisualizationDisplay(visualizer, envelopeKnobs, tensionKnobs) {
  const MAX_POINT_SEPARATION = 75;

  const { delay, attack, hold, decay, sustain, release } = envelopeKnobs;
  const { attack: attackTension, decay: decayTension, release: releaseTension } = tensionKnobs;

  const ptDelay = (MAX_POINT_SEPARATION * delay.value / 100);
  const ptAttack = ptDelay + (MAX_POINT_SEPARATION * attack.value / 100);
  const ptHold = ptAttack + (MAX_POINT_SEPARATION * hold.value / 100);
  const ptDecay = ptHold + (MAX_POINT_SEPARATION * decay.value / 100) * (100 - sustain.value) / 100;
  const ptSustain = 100 - sustain.value; // y value
  const ptRelease = ptDecay + (MAX_POINT_SEPARATION * release.value / 100);
  // TODO: better tension visualization
  const tnAttack = (ptAttack - ptDelay) * attackTension.value / 100;
  const tnDecay = (ptDecay - ptHold) * decayTension.value / 100;
  const tnRelease = (ptRelease - ptDecay) * releaseTension.value / 100;

  visualizer.shape.setAttribute('d',
    `M${ptDelay},100`+
    `C${tnAttack<0?ptDelay-tnAttack:ptDelay},100,${tnAttack>0?ptAttack-tnAttack:ptAttack},0,${ptAttack},0`+
    `L${ptHold},0`+
    `C${tnDecay>0?ptHold+tnDecay:ptHold},0,${tnDecay<0?ptDecay+tnDecay:ptDecay},${ptSustain},${ptDecay},${ptSustain}`+
    `C${tnRelease>0?ptDecay+tnRelease:ptDecay},${ptSustain},${tnRelease<0?ptRelease+tnRelease:ptRelease},100,${ptRelease},100`
  );
  visualizer.delay.setAttribute('cx', ptDelay);
  visualizer.attack.setAttribute('cx', ptAttack);
  visualizer.hold.setAttribute('cx', ptHold);
  visualizer.decay.setAttribute('cx', ptDecay);
  visualizer.decay.setAttribute('cy', ptSustain);
  visualizer.release.setAttribute('cx', ptRelease);
}

function createDemoElements() {
  // visualizer
  const visualizer = {};
  const visualizerContainer = crel('div',
    { class: styles.flEnvelopeVisualizer },
    [
      crsvg('svg',
        { class: styles.flEnvelopeVisualizerSvg, viewBox: '0 0 300 100', preserveAspectRatio: 'xMinYMid slice' },
        [
          visualizer.shape = crsvg('path',
            { d: 'M0,100L0,0', 'stroke-width': 2 }
          ),
          visualizer.delay = crsvg('circle',
            { cx: 0, cy: 100, r: 6, 'stroke-width': 2 }
          ),
          visualizer.attack = crsvg('circle',
            { cx: 0, cy: 0, r: 6, 'stroke-width': 2 }
          ),
          visualizer.hold = crsvg('circle',
            { cx: 0, cy: 0, r: 6, 'stroke-width': 2 }
          ),
          visualizer.decay = crsvg('circle',
            { cx: 0, cy: 100, r: 6, 'stroke-width': 2 }
          ),
          visualizer.release = crsvg('circle',
            { cx: 0, cy: 100, r: 6, 'stroke-width': 2 }
          ),
        ]
      )
    ]
  );

  // knobs setup
  const knobInfo = {
    delay: {
      label: 'Delay',
      hasTension: false
    },
    attack: {
      label: 'Att',
      hasTension: true
    },
    hold: {
      label: 'Hold',
      hasTension: false
    },
    decay: {
      label: 'Dec',
      hasTension: true
    },
    sustain: {
      label: 'Sus',
      hasTension: false
    },
    release: {
      label: 'Rel',
      hasTension: true
    }
  }

  // envelope knobs
  const envelopeKnobsContainer = crel('div', { class: styles.flEnvelopeControls });
  const envelopeKnobs = {};
  Object.entries(knobInfo).forEach(([key, item]) => {
    const knob = crel('div', {
      class: [styles.flDemoKnob, styles.flDemoEnvelopeKnob].join(' '),
      'data-type': key
    });
    const control = crel('div',
      {
        class: [styles.flDemoKnob, styles.flEnvelopeControl].join(' ')
      },
      [
        knob,
        crel('div', { class: styles.flEnvelopeLabel }, item.label)
      ]
    );
    envelopeKnobsContainer.appendChild(control);
    envelopeKnobs[key] = knob;
  });

  // tension knobs
  const tensionKnobsContainer = crel('div', { class: styles.flEnvelopeTension });
  let prevKnobHadTension = false;
  const tensionKnobs = {};
  Object.entries(knobInfo).forEach(([key, item]) => {
    if (item.hasTension) {
      const knob = crel('div', {
        class: [styles.flDemoKnob, styles.flDemoTensionKnob].join(' '),
        'data-type': key
      });
      prevKnobHadTension = true;
      tensionKnobsContainer.appendChild(knob);
      tensionKnobs[key] = knob;
    } else {
      const label = crel('div', { class: styles.flEnvelopeLabel });
      if (prevKnobHadTension) {
        label.textContent = 'Tension';
      }
      prevKnobHadTension = false;
      tensionKnobsContainer.appendChild(label);
    }
  });

  //  panel
  const panel = crel('div', { class: styles.flEnvelope },
    [
      visualizerContainer,
      envelopeKnobsContainer,
      tensionKnobsContainer
    ]
  );
  return {
    panel,
    visualizer,
    envelopeKnobs,
    tensionKnobs,
  };
}
