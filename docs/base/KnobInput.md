# `KnobInput`

The `KnobInput` class is base component for defining a single knob, dial, slider, etc.

The base class alone provides no visual component and very simple defaults, but it is designed to be customizable for all sorts of applications. It also takes care of accessibility, supporting user input via mouse drag, touchscreen drag, mouse wheel, mouse double-click, and keyboard.

If you want a fully styled input, look at the [documentation for other components](https://github.com/jhnsnc/precision-inputs/tree/master/docs/) or read below to customize your own.

## Basic Usage

1. **Include base styles from `css/precision-inputs.base.css` and base component script from `scripts/precision-inputs.base.js`**

> If you are using CommonJS or UMD modules for your front-end, you can instead use the script in `common/` and `umd/` respectively.

> If you are including styled components, those CSS/JS files also include all base component styles/classes.

2. **Create a container element and a visual element:**

```html
<div class="my-knob-container">
  <div class="my-knob-visuals"></div>
</div>
```

> The container may be any size, and the visual element should be styled how you want the input to look. They will receive the classes `knob-input__container` and `knob-input__visual` respectively upon initialization.

3. **Initialize the component in your JS:**

```js
var myKnobContainer = document.querySelector('.my-knob-container');
var myKnobVisuals = document.querySelector('.my-knob-visuals');
var myKnobInput = new KnobInput(myKnobContainer, myKnobVisuals);
```

4. **Access the value when needed via JS:**

```js
// retrieve value
var currentValue = myKnobInput.value;

// set value
myKnobInput.value = 0.5;

// watch for changes
myKnobInput.addEventListener('change', function(evt) {
  console.log(evt.target.value);
});
```

## Input Configuration

You can specify a `min` and `max` value in the setup function, as well as a `step` size. These behave the same way as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element.

```js
var myKnobInput = new KnobInput(myKnobContainer, myKnobVisuals, {
  min: -100,
  max: 100,
  step: 5
});
```

You can also set an `initial` value and determine how precise drag and mouse wheel actions are with the `dragResistance` and `wheelResistance` options.

```js
var myKnobInput = new KnobInput(myKnobContainer, myKnobVisuals, {
  initial: 0.4, // default = half-way between `min` and `max`
  dragResistance: 150, // default = 100
  wheelResistance: 70, // default = 100
});
```

## Event Passthrough

You can add/remove events on the `KnobInput` instance just like you would for a normal `<input>` element.

```js
myKnobInput.addEventListener('change', function(evt) {
  console.log('I changed value:', evt.target.value);
});

myKnobInput.addEventListener('focus', function(evt) {
  console.log('I now have keyboard focus');
});

myKnobInput.addEventListener('blur', function(evt) {
  console.log('I lost keyboard focus');
});
```

## Customizing Visual Appearance

### Drag and Selected States

The document `body` will receive class `knob-input__drag-active` whenever the user is dragging a knob input. The default behavior in this case is to change the cursor to the closed "grabbing" cursor. The input container itself will also receive the class `drag-active` for the duration of the interaction.

The input container will also receive the class `focus-active` whenever the input has focus. This allows the visual element to receive CSS changes based on the focus state even though the hidden input element is actually the element holding the browser's focus (this is done for accessibility reasons).

### Visual Context

You can set a custom `updateVisuals` callback to update the appearance of the input's visual element. Any time the input changes value, this callback will get called with two parameters: the new input value in normalized form (`0` ≤ `n` ≤ `1`) and the actual new value.

```js
var myKnobInput = new KnobInput(myKnobContainer, myKnobVisuals, {
  updateVisuals: function(norm) {
    // rotate the element between 0 and 360 degrees, based on current value
    this.element.style[this.transformProperty] = 'rotate(' + (360*norm) + 'deg)';
    // fade the background color between red and green, based on current value
    this.element.style.backgroundColor = 'rgb(' + Math.floor(256*(1-norm)) + ',' + Math.floor(256*norm) + ',0)';
  }
});
```

Inside the `updateVisuals` callback, the visual element will always be available as `this.element`. This is because the `updateVisuals` callback is bound to an internal visual context. There is also `this.transformProperty` available for convenience, representing the appropriate CSS transform property name for the active web browser.

You can extend the visual context by specifying a `visualContext` function. This gets run once on creation and can be useful for caching DOM elements and calculated values, so that the `updateVisuals` can be more efficient and avoid unnecessary DOM operations, calculations, etc.

```js
var myKnobInput = new KnobInput(myKnobContainer, myKnobVisuals, {
  visualContext: function() {
    // cache DOM elemetn
    this.textDisplay = this.element.querySelector('div.current-value-indicator');
    // purple
    this.minColor = {
      r: 156,
      g: 39,
      b: 175
    };
    // orange
    this.maxColor = {
      r: 255,
      g: 152,
      b: 0
    };
  },
  updateVisuals: function(norm, val) {
    // set the text to the new value
    this.textDisplay.innerText = val;
    // change the text color based on the current value
    var r = this.minColor.r*(1-norm) + this.maxColor.r*norm;
    var g = this.minColor.g*(1-norm) + this.maxColor.g*norm;
    var b = this.minColor.b*(1-norm) + this.maxColor.b*norm;
    this.element.style.color = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
});
```

## All Options

In addition to the `containerElement` and `visualElement` parameters of the `KnobInput` constructor, there is an `options` object for you to specify any of the following settings.

| `options` property   | default value | description |
|----------------------|---------------|-------------|
| `min`                | `0` | The minimum input value. Same as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element. |
| `max`                | `1` | The maximum input value. Same as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element. |
| `step`               | `'any'` | The step amount for value changes. Same as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element. |
| `initial`            | average of `min` and `max` | The initial value of the input. Also used when the user double-clicks to reset the input value. |
| `dragResistance`     | `100` | The amount of resistance to value change on mouse/touch drag events. Higher value means more precision, and the user will have to drag farther to change the input's value. |
| `wheelResistance`    | `100` | The amount of resistance to value change on mouse wheel scroll. Higher value means more precision, and the mouse wheel will be less effective at changing the input's value. |
| `visualContext`      | callback that sets `minRotation` to `0` and `maxRotation` to `360` | Callback that allows for customization of the visual context by setting properties via `this`. Note that `this.element` and `this.transformProperty` will already have values. Useful for caching DOM references, calculations, etc for use in the `updateVisuals` callback. |
| `updateVisuals`      | callback that updates visual element rotation based on `minRotation`/`maxRotation` | Custom callback for updating the input visuals based on changes to the input value. Has access to the visual context via `this` (e.g. `this.element`). |
