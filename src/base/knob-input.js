import './knob-input.scss';

import { getTransformProperty } from '../utils/ui';

// TODO: add input label for screenreaders

const transformProperty = getTransformProperty();

export default class KnobInput {
  constructor(containerElement, visualElement, options = {}) {
    // make sure containerElement and visualElement are valid
    if (!containerElement) {
      throw new Error('KnobInput constructor must receive a valid container element');
    } else if (!visualElement) {
      throw new Error('KnobInput constructor must receive a valid visual element');
    } else if (!containerElement.contains(visualElement)) {
      throw new Error('The KnobInput\'s container element must contain its visual element');
    }

    // settings
    var step = options.step || 'any';
    var min = typeof options.min === 'number' ? options.min : 0;
    var max = typeof options.max === 'number' ? options.max : 1;
    this.initial = typeof options.initial === 'number' ? options.initial : 0.5 * (min + max);
    this.dragResistance = typeof options.dragResistance === 'number' ? options.dragResistance : 100;
    this.dragResistance *= 3;
    this.dragResistance /= max-min;
    this.wheelResistance = typeof options.wheelResistance === 'number' ? options.wheelResistance : 100;
    this.wheelResistance *= 40;
    this.wheelResistance /= max-min;
    this.setupVisualContext = typeof options.visualContext === 'function' ? options.visualContext : KnobInput.setupRotationContext(0, 360);
    this.updateVisuals = typeof options.updateVisuals === 'function' ? options.updateVisuals : KnobInput.rotationUpdateFunction;

    // setup input
    var rangeInput = document.createElement('input');
    rangeInput.type = 'range';
    rangeInput.step = step;
    rangeInput.min = min;
    rangeInput.max = max;
    rangeInput.value = this.initial;
    containerElement.appendChild(rangeInput);

    // elements
    this._container = containerElement;
    this._container.classList.add('knob-input__container');
    this._input = rangeInput;
    this._input.classList.add('knob-input__input');
    this._visualElement = visualElement;
    this._visualElement.classList.add('knob-input__visual');

    // visual context
    this._visualContext = {
      element: this._visualElement,
      transformProperty: transformProperty,
    };
    this.setupVisualContext.apply(this._visualContext);
    this.updateVisuals = this.updateVisuals.bind(this._visualContext);

    // internals
    this._activeDrag = false;

    // define event listeners
    // have to store bound versions of handlers so they can be removed later
    this._handlers = {
      inputChange: this.handleInputChange.bind(this),
      touchStart: this.handleTouchStart.bind(this),
      touchMove: this.handleTouchMove.bind(this),
      touchEnd: this.handleTouchEnd.bind(this),
      touchCancel: this.handleTouchCancel.bind(this),
      mouseDown: this.handleMouseDown.bind(this),
      mouseMove: this.handleMouseMove.bind(this),
      mouseUp: this.handleMouseUp.bind(this),
      mouseWheel: this.handleMouseWheel.bind(this),
      doubleClick: this.handleDoubleClick.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
    };
    // add listeners
    this._input.addEventListener('change', this._handlers.inputChange);
    this._input.addEventListener('touchstart', this._handlers.touchStart);
    this._input.addEventListener('mousedown', this._handlers.mouseDown);
    this._input.addEventListener('wheel', this._handlers.mouseWheel);
    this._input.addEventListener('dblclick', this._handlers.doubleClick);
    this._input.addEventListener('focus', this._handlers.focus);
    this._input.addEventListener('blur', this._handlers.blur);
    // set initial value
    this.updateToInputValue();
  }

  static setupRotationContext(minRotation, maxRotation) {
    return function() {
      this.minRotation = minRotation;
      this.maxRotation = maxRotation;
    };
  }

  static rotationUpdateFunction(norm) {
    this.element.style[this.transformProperty] = `rotate(${this.maxRotation*norm-this.minRotation*(norm-1)}deg)`;
  }

  // handlers
  handleInputChange(evt) {
    // console.log('input change');
    this.updateToInputValue();
  }

  handleTouchStart(evt) {
    // console.log('touch start');
    this.clearDrag();
    evt.preventDefault();
    var touch = evt.changedTouches.item(evt.changedTouches.length - 1);
    this._activeDrag = touch.identifier;
    this.startDrag(touch.clientY);
    // drag update/end listeners
    document.body.addEventListener('touchmove', this._handlers.touchMove);
    document.body.addEventListener('touchend', this._handlers.touchEnd);
    document.body.addEventListener('touchcancel', this._handlers.touchCancel);
  }

  handleTouchMove(evt) {
    // console.log('touch move');
    var activeTouch = this.findActiveTouch(evt.changedTouches);
    if (activeTouch) {
      this.updateDrag(activeTouch.clientY);
    } else if (!this.findActiveTouch(evt.touches)) {
      this.clearDrag();
    }
  }

  handleTouchEnd(evt) {
    // console.log('touch end');
    var activeTouch = this.findActiveTouch(evt.changedTouches);
    if (activeTouch) {
      this.finalizeDrag(activeTouch.clientY);
    }
  }

  handleTouchCancel(evt) {
    // console.log('touch cancel');
    if (this.findActiveTouch(evt.changedTouches)) {
      this.clearDrag();
    }
  }

  handleMouseDown(evt) {
    // console.log('mouse down');
    this.clearDrag();
    evt.preventDefault();
    this._activeDrag = true;
    this.startDrag(evt.clientY);
    // drag update/end listeners
    document.body.addEventListener('mousemove', this._handlers.mouseMove);
    document.body.addEventListener('mouseup', this._handlers.mouseUp);
  }

  handleMouseMove(evt) {
    // console.log('mouse move');
    if (evt.buttons&1) {
      this.updateDrag(evt.clientY);
    } else {
      this.finalizeDrag(evt.clientY);
    }
  }

  handleMouseUp(evt) {
    // console.log('mouse up');
    this.finalizeDrag(evt.clientY);
  }

  handleMouseWheel(evt) {
    // console.log('mouse wheel');
    evt.preventDefault();
    this._input.focus();
    this.clearDrag();
    this._prevValue = parseFloat(this._input.value);
    this.updateFromDrag(evt.deltaY, this.wheelResistance);
  }

  handleDoubleClick(evt) {
    // console.log('double click');
    this.clearDrag();
    this._input.value = this.initial;
    this.updateToInputValue();
  }

  handleFocus(evt) {
    // console.log('focus on');
    this._container.classList.add('focus-active');
  }

  handleBlur(evt) {
    // console.log('focus off');
    this._container.classList.remove('focus-active');
  }

  // dragging
  startDrag(yPosition) {
    this._dragStartPosition = yPosition;
    this._prevValue = parseFloat(this._input.value);

    this._input.focus();
    document.body.classList.add('knob-input__drag-active');
    this._container.classList.add('drag-active');
    this._input.dispatchEvent(new InputEvent('knobdragstart'));
  }

  updateDrag(yPosition) {
    var diff = yPosition - this._dragStartPosition;
    this.updateFromDrag(diff, this.dragResistance);
    this._input.dispatchEvent(new InputEvent('change'));
  }

  finalizeDrag(yPosition) {
    var diff = yPosition - this._dragStartPosition;
    this.updateFromDrag(diff, this.dragResistance);
    this.clearDrag();
    this._input.dispatchEvent(new InputEvent('change'));
    this._input.dispatchEvent(new InputEvent('knobdragend'));
  }

  clearDrag() {
    document.body.classList.remove('knob-input__drag-active');
    this._container.classList.remove('drag-active');
    this._activeDrag = false;
    this._input.dispatchEvent(new InputEvent('change'));
    // clean up event listeners
    document.body.removeEventListener('mousemove', this._handlers.mouseMove);
    document.body.removeEventListener('mouseup', this._handlers.mouseUp);
    document.body.removeEventListener('touchmove', this._handlers.touchMove);
    document.body.removeEventListener('touchend', this._handlers.touchEnd);
    document.body.removeEventListener('touchcancel', this._handlers.touchCancel);
  }

  updateToInputValue() {
    var newVal = parseFloat(this._input.value);
    this.updateVisuals(this.normalizeValue(newVal), newVal);
  }

  updateFromDrag(dragAmount, resistance) {
    var newVal = this.clampValue(this._prevValue - (dragAmount/resistance));
    this._input.value = newVal;
    this.updateVisuals(this.normalizeValue(newVal), newVal);
  }

  // utils
  clampValue(val) {
    var min = parseFloat(this._input.min);
    var max = parseFloat(this._input.max);
    return Math.min(Math.max(val, min), max);
  }

  normalizeValue(val) {
    var min = parseFloat(this._input.min);
    var max = parseFloat(this._input.max);
    return (val-min)/(max-min);
  }

  findActiveTouch(touchList) {
    var i, len, touch;
    for (i=0, len=touchList.length; i<len; i++)
      if (this._activeDrag === touchList.item(i).identifier)
        return touchList.item(i);
    return null;
  }

  // public passthrough methods
  addEventListener() { this._input.addEventListener.apply(this._input, arguments); }
  removeEventListener() { this._input.removeEventListener.apply(this._input, arguments); }
  focus() { this._input.focus.apply(this._input, arguments); }
  blur() { this._input.blur.apply(this._input, arguments); }

  // getters/setters
  get value() {
    return parseFloat(this._input.value);
  }
  set value(val) {
    this._input.value = val;
    this.updateToInputValue();
    this._input.dispatchEvent(new Event('change'));
  }
}
