# `FLReactiveGripDial`

The `FLReactiveGripDial` class accepts an empty div and creates a dial input styled with a ridged "metal" top and grip bumps that appear on interaction. This component is well-suited for larger, more prominent UI controls.

## Basic Usage

1. **Include styles from `dist/precision-inputs.css` and script from `dist/precision-inputs.js`**

2. **Create an empty container element:**

```html
<div class="my-fl-knob"></div>
```

> The container should be styled to make it the appropriate `width`/`height` for your app.

3. **Initialize the component in your JS:**

```js
const myKnobContainer = document.querySelector('.my-fl-knob');
const myKnob = new FLReactiveGripDial(myKnobContainer);
```

4. **Access the value when needed via JS:**

```js
// retrieve value
let currentValue = myKnob.value;

// set value
myKnobInput.value = 0.5;

// watch for changes
myKnobInput.addEventListener('change', function(evt) {
  currentValue = evt.target.value;
  console.log(currentValue);
});
```

## Options

Below are the options available in addition to the base [`KnobInput` options](https://github.com/jhnsnc/precision-inputs/tree/master/docs/base/KnobInput.md#all-options).

| `options` property | default value | description |
|--------------------|---------------|-------------|
| `color`            | `'#ffa830'` | The color to use for the focus indicator and indicator dot. |
| `guideTicks`       | `9` | The number of tick marks on the outer guide ring. |
| `gripBumps`        | `5` | The number of grip bumps that appear when interacting with the dial. |
| `gripExtrusion`    | `0.5` | The degree to which the grips "cut" into the dial when the user interacts with it. Range: (0.0, 1.0) |
| `minRotation`      | angle pointing towards the first guide tick | The angle (in degrees) of rotation corresponding to the `min` value, relative to pointing straight down. |
| `maxRotation`      | angle pointing towards the last guide tick | The angle (in degrees) of rotation corresponding to the `max` value, relative to pointing straight down. |
