import crel from 'crel';

import FLReactiveGripDial from '../fl-controls/fl-reactive-grip-dial';

import FLColors from '../fl-controls/fl-colors';

import * as styles from './demo-mod-wheels.scss';

export default function setupModWheels() {
  const { panel, knobs } = createDemoElements();
  document.body.appendChild(panel);

  // envelope
  new FLReactiveGripDial(knobs.env, {
    color: FLColors.volume.str,
    guideTicks: 7,
    gripBumps: 3,
    gripExtrusion: 0.1,
  });

  // cutoff
  new FLReactiveGripDial(knobs.cut, {
    color: FLColors.modX.str,
  });

  // resonance
  new FLReactiveGripDial(knobs.res, {
    color: FLColors.modY.str,
  });
}

function createDemoElements() {
  // panel
  const panel = crel('div', { class: styles.modWheels });

  // knobs
  const knobs = {
    env: {
      label: 'Env',
    },
    cut: {
      label: 'Cut',
    },
    res: {
      label: 'Res',
    },
  };
  Object.entries(knobs).forEach(([key, val]) => {
    panel.appendChild(crel('div', { class: styles.modWheelsControl },
      [
        knobs[key] = crel('div', { class: styles.modWheelsKnob, 'data-type': key }),
        crel('div', { class: styles.modWheelsLabel }, val.label)
      ]
    ));
  });

  return {
    panel,
    knobs,
  };
}
