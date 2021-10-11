import crel from 'crel';

import { getTransformProperty, isHtmlElement } from '../utils/ui';

import * as styles from './knob-input.scss';

// TODO: add input label for screenreaders

export default class KnobInput {
  constructor(containerElement, options = {}) {
    if (!isHtmlElement(containerElement)) {
      throw new Error('KnobInput constructor must receive a valid container element');
    }

    // settings
    const step = options.step || 'any';
    const min = typeof options.min === 'number' ? options.min : 0;
    const max = typeof options.max === 'number' ? options.max : 1;
    this.initial = typeof options.initial === 'number' ? options.initial : 0.5 * (min + max);
    this.dragResistance = typeof options.dragResistance === 'number' ? options.dragResistance : 100;
    this.dragResistance *= 3 / (max - min);
    this.wheelResistance = typeof options.wheelResistance === 'number' ? options.wheelResistance : 100;
    this.wheelResistance *= 40 / (max - min);

    // setup elements
    this._input = crel('input', { class: styles.knobInputBase, type: 'range', step, min, max, value: this.initial });
    containerElement.appendChild(this._input);
    this._container = containerElement;
    this._container.classList.add(styles.knobInputContainer);

    // misc variables
    this.transformProperty = getTransformProperty();
    this.focusActiveClass = typeof options.focusActiveClass === 'string' ? options.focusActiveClass : null;
    this.dragActiveClass = typeof options.dragActiveClass === 'string' ? options.dragActiveClass : null;
    this._activeDrag = false;

    // event listeners
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchMove = this.handleTouchMove.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.handleTouchCancel = this.handleTouchCancel.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseWheel = this.handleMouseWheel.bind(this);
    this.handleMiddleClick = this.handleMiddleClick.bind(this);
    this.handleDoubleClick = this.handleDoubleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this._input.addEventListener('change', this.handleInputChange);
    this._input.addEventListener('touchstart', this.handleTouchStart);
    this._input.addEventListener('mousedown', this.handleMouseDown);
    this._input.addEventListener('wheel', this.handleMouseWheel);
    this._input.addEventListener('auxclick', this.handleMiddleClick);
    this._input.addEventListener('dblclick', this.handleDoubleClick);
    this._input.addEventListener('focus', this.handleFocus);
    this._input.addEventListener('blur', this.handleBlur);
  }

  setupVisuals = (updateCallback, visualElement) => {
    if (typeof updateCallback === 'function') {
      this.updateVisuals = updateCallback;
    } else {
      throw new Error('KnobInput setupVisuals must receive a valid updateCallback function');
    }

    if (!isHtmlElement(visualElement)) {
      visualElement.classList.add(styles.knobInputVisual);
    }

    this.updateToInputValue();
  };

  // handlers
  handleInputChange() {
    this.updateToInputValue();
  }

  handleTouchStart(evt) {
    this.clearDrag();
    evt.preventDefault();
    const touch = evt.changedTouches.item(evt.changedTouches.length - 1);
    this._activeDrag = touch.identifier;
    this.startDrag(touch.clientY);
    // drag update/end listeners
    document.body.addEventListener('touchmove', this.handleTouchMove);
    document.body.addEventListener('touchend', this.handleTouchEnd);
    document.body.addEventListener('touchcancel', this.handleTouchCancel);
  }

  handleTouchMove(evt) {
    const activeTouch = this.findActiveTouch(evt.changedTouches);
    if (activeTouch) {
      this.updateDrag(activeTouch.clientY);
    } else if (!this.findActiveTouch(evt.touches)) {
      this.clearDrag();
    }
  }

  handleTouchEnd(evt) {
    const activeTouch = this.findActiveTouch(evt.changedTouches);
    if (activeTouch) {
      this.finalizeDrag(activeTouch.clientY);
    }
  }

  handleTouchCancel(evt) {
    if (this.findActiveTouch(evt.changedTouches)) {
      this.clearDrag();
    }
  }

  handleMouseDown(evt) {
    if (evt.buttons & 0b1) { // left mouse button
      this.clearDrag();
      evt.preventDefault();
      this._activeDrag = true;
      this.startDrag(evt.clientY);
      // drag update/end listeners
      document.body.addEventListener('mousemove', this.handleMouseMove);
      document.body.addEventListener('mouseup', this.handleMouseUp);
    }
  }

  handleMouseMove(evt) {
    if (evt.buttons & 0b1) { // left mouse button held
      this.updateDrag(evt.clientY);
    } else {
      this.finalizeDrag(evt.clientY);
    }
  }

  handleMouseUp(evt) {
    this.finalizeDrag(evt.clientY);
  }

  handleMouseWheel(evt) {
    evt.preventDefault();
    this._input.focus();
    this.clearDrag();
    this._prevValue = parseFloat(this._input.value);
    this.updateFromDrag(evt.deltaY, this.wheelResistance);
  }

  handleMiddleClick(evt) {
    if (evt.button === 1) { // middle click; for some reason `buttons` doesn't work with auxclick event
      this.clearDrag();
      this._input.value = this.initial;
      this.updateToInputValue();
    }
  }

  handleDoubleClick() {
    this.clearDrag();
    this._input.value = this.initial;
    this.updateToInputValue();
  }

  handleFocus() {
    if (this.focusActiveClass) {
      this._container.classList.add(this.focusActiveClass);
    }
  }

  handleBlur() {
    if (this.focusActiveClass) {
      this._container.classList.remove(this.focusActiveClass);
    }
  }

  // dragging
  startDrag(yPosition) {
    this._dragStartPosition = yPosition;
    this._prevValue = parseFloat(this._input.value);

    this._input.focus();
    document.body.classList.add(styles.knobInputDragActive);
    if (this.dragActiveClass) {
      this._container.classList.add(this.dragActiveClass);
    }
    this._input.dispatchEvent(new InputEvent('knobdragstart'));
  }

  updateDrag(yPosition) {
    const diff = yPosition - this._dragStartPosition;
    this.updateFromDrag(diff, this.dragResistance);
    this._input.dispatchEvent(new InputEvent('change'));
  }

  finalizeDrag(yPosition) {
    const diff = yPosition - this._dragStartPosition;
    this.updateFromDrag(diff, this.dragResistance);
    this.clearDrag();
    this._input.dispatchEvent(new InputEvent('change'));
    this._input.dispatchEvent(new InputEvent('knobdragend'));
  }

  clearDrag() {
    document.body.classList.remove(styles.knobInputDragActive);
    if (this.dragActiveClass) {
      this._container.classList.remove(this.dragActiveClass);
    }
    this._activeDrag = false;
    this._input.dispatchEvent(new InputEvent('change'));
    // clean up event listeners
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('mouseup', this.handleMouseUp);
    document.body.removeEventListener('touchmove', this.handleTouchMove);
    document.body.removeEventListener('touchend', this.handleTouchEnd);
    document.body.removeEventListener('touchcancel', this.handleTouchCancel);
  }

  updateToInputValue() {
    if (typeof this.updateVisuals === 'function') {
      const newVal = parseFloat(this._input.value);
      this.updateVisuals(this.normalizeValue(newVal), newVal);
    }
  }

  updateFromDrag(dragAmount, resistance) {
    const newVal = this.clampValue(this._prevValue - (dragAmount/resistance));
    this._input.value = newVal;
    if (typeof this.updateVisuals === 'function') {
      this.updateVisuals(this.normalizeValue(newVal), newVal);
    }
  }

  // utils
  clampValue(val) {
    return Math.min(Math.max(val, parseFloat(this._input.min)), parseFloat(this._input.max));
  }

  normalizeValue(val) {
    const min = parseFloat(this._input.min);
    const max = parseFloat(this._input.max);
    return (val - min) / (max - min);
  }

  findActiveTouch(touchList) {
    for (let i = 0, len = touchList.length; i < len; i += 1)
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
  // TODO: add getters/setters for other properties like min/max?
}
