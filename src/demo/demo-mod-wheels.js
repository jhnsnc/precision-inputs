require('./demo-mod-wheels.scss');

import FLReactiveGripDial from '../fl-controls/fl-reactive-grip-dial';

import FLColors from '../fl-controls/fl-colors';

export default function setupModWheels() {
  const envDial = new FLReactiveGripDial(document.querySelector('.mod-wheels .mod-wheels__knob.env'), {
    indicatorDotColor: FLColors.volume.str,
    color: FLColors.volume.str,
  });

  const cutDial = new FLReactiveGripDial(document.querySelector('.mod-wheels .mod-wheels__knob.cut'), {
    indicatorDotColor: FLColors.modX.str,
    color: FLColors.modX.str,
  });

  const resDial = new FLReactiveGripDial(document.querySelector('.mod-wheels .mod-wheels__knob.res'), {
    indicatorDotColor: FLColors.modY.str,
    color: FLColors.modY.str,
  });
}
