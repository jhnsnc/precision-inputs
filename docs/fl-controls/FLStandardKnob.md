# `FLStandardKnob`

The `FLStandardKnob` class accepts an empty div and creates a knob input styled to look like a standard knob from FL Studio.

## Basic Usage

1. **Include styles from `css/precision-inputs.fl-controls.css` and script from `scripts/precision-inputs.fl-controls.js`**

> If you are using CommonJS or UMD modules for your front-end, you can instead use the script in `common/` and `umd/` respectively.

2. **Create an empty container element:**

```html
<div class="my-fl-knob"></div>
```

> The container should be styled to make it the appropriate `width`/`height` for your app.

3. **Initialize the component in your JS:**

```js
var myKnobContainer = document.querySelector('.my-fl-knob');
var myKnob = new FLStandardKnob(myKnobContainer);
```

4. **Access the value when needed via JS:**

```js
// retrieve value
var currentValue = myKnob.value;

// set value
myKnobInput.value = 0.5;

// watch for changes
myKnobInput.addEventListener('change', function(evt) {
  console.log(evt.target.value);
});
```

## Options

Below are the options available in addition to the base [`KnobInput` options](https://github.com/jhnsnc/precision-inputs/tree/master/docs/base/KnobInput.md#all-options).

| `options` property | default value | description |
|--------------------|---------------|-------------|
| `indicatorDot`     | `true` | Whether the knob should display an indicator dot for making it easier to read the current value. |
| `ringType`         | `'positive'` | The fill style for the indicator ring. <br/>`'positive'` - color fills in from the left as value increases <br/>`'negative'` - color fills in from the right as value decreases <br/>`'split'` - color fills left/right from middle as value increases/decreases relative to the middle value (half-way between `min` and `max`) |
| `color`            | `'#4eccff'` | The color to use for the indicator ring fill, focus indicator, and indicator dot (if present). |
