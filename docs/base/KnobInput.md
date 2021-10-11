# `KnobInput`

The `KnobInput` class is base component for defining a single knob, dial, slider, etc.

The base class alone provides no visual component, but it is designed to be customizable for all sorts of applications. It also takes care of accessibility, supporting user input via mouse drag, touchscreen drag, mouse wheel, mouse double-click, and keyboard input.

If you want a fully styled input, look at the [documentation for other components](https://github.com/jhnsnc/precision-inputs/tree/master/docs/) or read below to customize your own.

## Basic Usage

1. **Include styles from `dist/precision-inputs.css` and script from `dist/precision-inputs.js`**

2. **Create a container element and a visual element:**

```html
<div class="my-knob-container">
  <div class="my-knob-visuals"></div>
</div>
```

> The container may be any size, and the visual element should be styled how you want the input to look.

3. **Initialize the component in your JS:**

```js
const myKnobContainer = document.querySelector('.my-knob-container');
const myKnobInput = new KnobInput(myKnobContainer);
```

4. **Set up the visuals:**

```js
const myKnobVisuals = document.querySelector('.my-knob-visuals');
const rotateToValue = (norm, val) => {
  myKnobVisuals.style[myKnobInput.transformProperty] = `rotate(${-180 + 360*norm}deg)`;
};

myKnobInput.setupVisuals(rotateToValue, myKnobVisuals);
```

5. **Access the value as you would any normal range input:**

```js
// retrieve value
let currentValue = myKnobInput.value;

// set value
myKnobInput.value = 0.5;

// watch for changes
myKnobInput.addEventListener('change', function(evt) {
  currentValue = evt.target.value;
  console.log(currentValue);
});
```

## Input Usage

### Input Configuration

You can specify a `min` and `max` value in the setup function, as well as a `step` size. These behave the same way as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element.

```js
const myKnobInput = new KnobInput(myKnobContainer, {
  min: -100,
  max: 100,
  step: 5
});
```

You can also set an `initial` value and determine how precise drag and mouse wheel actions are with the `dragResistance` and `wheelResistance` options.

```js
const myKnobInput = new KnobInput(myKnobContainer, {
  initial: 0.4, // default = half-way between `min` and `max`
  dragResistance: 150, // default = 100
  wheelResistance: 70, // default = 100
});
```

### Event Passthrough

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

### Visual Updates

In order to make your component respond visually to input changes, you will need to call the `setupVisuals` method after initialization. It accepts a callback function that will be called whenever the input value changes. The second parameter is the visual element which will get a class added for styling purposes.

```js
const updateVisuals = (norm, val) => {
  // rotate visual element
  myVisualElement.style[myKnobInput.transformProperty] = `rotate(${-180 + 360*norm}deg)`;
  // update label
  myLabel.textContent = `current value = ${val}`;
};

myKnobInput.setupVisuals(updateVisuals, myVisualElement);
```

Any time the input changes value, the update callback will get invoked with two parameters: the new input value in normalized form (`0` ≤ `n` ≤ `1`) and the actual new value. In many cases, the normalized value will be most useful for calculations (e.g. `postion = (1-norm)*minPosition + norm*maxPosition`).

For convenience, all instances of KnobInput have a `transformProperty` property with the appropriate CSS transform property name for the active web browser.

### Drag and Selected States

During initialization, you can specify class names to be applied to the the container element during drag and focus states. These are important for helping the user to understand the state of the UI, especially if the user is adjusting values with keyboard input.

```js
const myKnobInput = new KnobInput(myKnobContainer, {
  dragActiveClass: 'drag-active',
  focusActiveClass: 'focus-active',
});
```

```css
/* in CSS */
.my-knob-container {
  transition: all 200ms;
}
.my-knob-container.drag-active {
  background: rgba(255,255,255,0.2);
}
.my-knob-container.focus-active {
  outline: 3px solid blue;
}
```

## All Options

In addition to the `containerElement` parameter of the `KnobInput` constructor, there is an `options` object for you to specify any of the following settings.

| `options` property   | default value | description |
|----------------------|---------------|-------------|
| `min`                | `0` | The minimum input value. Same as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element. |
| `max`                | `1` | The maximum input value. Same as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element. |
| `step`               | `'any'` | The step amount for value changes. Same as with the standard [range input](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range) element. |
| `initial`            | average of `min` and `max` | The initial value of the input. Also used when the user double-clicks to reset the input value. |
| `dragResistance`     | `100` | The amount of resistance to value change on mouse/touch drag events. Higher value means more precision, and the user will have to drag farther to change the input's value. |
| `wheelResistance`    | `100` | The amount of resistance to value change on mouse wheel scroll. Higher value means more precision, and the mouse wheel will be less effective at changing the input's value. |
| `dragActiveClass`    | `null` | This class will be added to the container element whenever the user has an active drag interaction to change the value of the input. |
| `focusActiveClass`   | `null` | This class will be added to the container element whenever the input has browser focus, which happens after most mouse interactions as well as with keyboard navigation. |
