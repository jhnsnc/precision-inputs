# Precision Inputs

These components can be styled to fit in perfectly in any app, and allow users to set precise values through many input modalities. Users can touch-and-drag, click-and-drag, scroll their mouse wheel, double click, or use keyboard input. After instantiation you can use the components just like you would any normal input.

Please report any issues you discover [on Github](https://github.com/jhnsnc/precision-inputs/issues).

## Demos

See https://codepen.io/jhnsnc/pen/mqPGQK/ for a demo using the `FLStandardKnob` component.

See https://github.com/jhnsnc/precision-inputs-demo for the same demo in a webpack setup.

## Documentation

See [the documentation table-of-contents](https://github.com/jhnsnc/precision-inputs/tree/master/docs/) for instructions on how to use/customize each type of component.

## Planned Features

- Components
  - Base
    - ✔ `KnobInput` - fully customizable, bare-bones base component
  - FL Controls
    - ✔ `FLStandardKnob` - easy-to-use base knob component
    - ✔ `FLReactiveGripDial` - detailed dial with "grip" bumps, good for larger controls
    - ❌ numerical range input (e.g. channel selector)
    - ❌ customizable-range knob (e.g. flexible fine-tune knob)
    - ❌ slider input
    - ❌ X-Y controller
    - ❌ other components composed and styled like FL Studio controls
  - ❓ possibly other sets of styled, ready-to-use components
- Performance
  - ❓ alter or replace rendering method to avoid the performance limitations of SVG
- Features
  - ❓ maybe add built-in logarithmic scaling to inputs
  - ❓ maybe add built-in input labels
  - ❓ direct support for React or other frameworks

## Package Contents
For now, the components are distributed as a single UMD module with all relevant classes accessible via the default export object.

```
precision-inputs
└── dist
    ├── precision-inputs.css
    ├── precision-inputs.css.map
    ├── precision-inputs.js
    └── precision-inputs.js.map
```
