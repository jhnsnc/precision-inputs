# Precision Inputs

> ⚠️ **Note:** This library is in **alpha**. The names and functionality of all classes, properties, and methods are subject to change without notice until the full v1.0 release. See [issues](https://github.com/jhnsnc/precision-inputs/issues/) for discussion of changes.

See https://codepen.io/jhnsnc/pen/mqPGQK/ for a demo using the `FLStandardKnob` component.

These components can be styled to fit in perfectly in any app, and allow users to set precise values through many input modalities. Users can touch-and-drag, click-and-drag, scroll their mouse wheel, double click, or use keyboard input. After instantiation you can use the components just like you would any normal input.

This library is in active development. Please report any issues you discover [on Github](https://github.com/jhnsnc/precision-inputs/issues).

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
    - ❌ X-Y controller
    - ❌ other components composed and styled like FL Studio controls
  - ❓ possibly other sets of styled, ready-to-use components
- Flexible deployment options
  - ✔ Common JS
  - ✔ UMD
  - ❌ ES modules *(see `src/` folder for now for uncompiled ES modules)*
  - ✔ `window` global
  - ❌ React bindings (likely a separate package when implemented)
  - ✔ CSS
  - ❌ Sass *(srr `src/` folder for now for uncompiled SCSS)*
- ⚠ Detailed documentation and usage demos (partial progress)
