require('./demo-mod-wheels.scss');

import FLReactiveGripDial from '../fl-controls/fl-reactive-grip-dial';

import FLColors from '../fl-controls/fl-colors';

export default function setupModWheels() {
  const envDial = new FLReactiveGripDial(document.querySelector('.mod-wheels .mod-wheels__knob.env'), {
    color: FLColors.volume.str,
    guideTicks: 7,
    gripBumps: 3,
    gripExtrusion: 0.1,
  });

  const cutDial = new FLReactiveGripDial(document.querySelector('.mod-wheels .mod-wheels__knob.cut'), {
    color: FLColors.modX.str,
  });

  const resDial = new FLReactiveGripDial(document.querySelector('.mod-wheels .mod-wheels__knob.res'), {
    color: FLColors.modY.str,
  });
}
