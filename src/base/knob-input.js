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
    this.smoothingThreshold = typeof options.smoothingThreshold === 'number' ? options.smoothingThreshold : 10;
    this.smoothingThreshold /= 100;
    this.smoothingThreshold *= max-min;
    this.smoothingFactor = typeof options.smoothingFactor === 'number' ? options.smoothingFactor : 4;
    this.smoothing = typeof options.smoothing === 'boolean' ? options.smoothing : true;
    this.dragResistance = typeof options.dragResistance === 'number' ? options.dragResistance : 100;
    this.dragResistance *= 3;
    this.dragResistance /= max-min;
    this.wheelResistance = typeof options.wheelResistance === 'number' ? options.wheelResistance : 100;
    this.wheelResistance *= 40;
    this.wheelResistance /= max-min;
    this.setupVisualContext = typeof options.visualContext === 'function' ? options.visualContext : KnobInput.setupRotationContext(0, 360);
    this.updateVisuals = typeof options.updateVisuals === 'function' ? options.updateVisuals : KnobInput.rotationUpdateFunction;

    this.dragMode = typeof options.dragMode !== 'undefined' ? options.dragMode : 'vertical';

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
    this._center;

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

    //run this function after rendering has finished
    setTimeout(this.runAfterRender.bind(this), 0);
  }

  //set centerpoint after rendering has finished
  runAfterRender(){
    this._center = this.findCenter(this._container)
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
    this.startDrag([touch.clientX, touch.clientY]);
    // drag update/end listeners
    document.body.addEventListener('touchmove', this._handlers.touchMove);
    document.body.addEventListener('touchend', this._handlers.touchEnd);
    document.body.addEventListener('touchcancel', this._handlers.touchCancel);
  }

  handleTouchMove(evt) {
    // console.log('touch move');
    var activeTouch = this.findActiveTouch(evt.changedTouches);
    if (activeTouch) {
      this.updateDrag([activeTouch.clientX, activeTouch.clientY]);
    } else if (!this.findActiveTouch(evt.touches)) {
      this.clearDrag();
    }
  }

  handleTouchEnd(evt) {
    // console.log('touch end');
    var activeTouch = this.findActiveTouch(evt.changedTouches);
    if (activeTouch) {
      this.finalizeDrag([activeTouch.clientX, activeTouch.clientY]);
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
    this.startDrag([evt.clientX, evt.clientY]);
    // drag update/end listeners
    document.body.addEventListener('mousemove', this._handlers.mouseMove);
    document.body.addEventListener('mouseup', this._handlers.mouseUp);
  }

  handleMouseMove(evt) {
    // console.log('mouse move');
    if (evt.buttons&1) {
      this.updateDrag([evt.clientX, evt.clientY]);
    } else {
      this.finalizeDrag([evt.clientX, evt.clientY]);
    }
  }

  handleMouseUp(evt) {
    // console.log('mouse up');
    this.finalizeDrag([evt.clientX, evt.clientY]);
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
  startDrag(pos) {
    this._dragStartPosition = pos;
    this._prevValue = parseFloat(this._input.value);

    this._input.focus();
    document.body.classList.add('knob-input__drag-active');
    this._container.classList.add('drag-active');

    this._input.dispatchEvent(new InputEvent('knobdragstart'));
  }

  updateDrag(pos) {
    switch(this.dragMode){
      case 'angular':
        this.updateFromNormalizedValue(this.bearing(pos));
        break;
      case 'horizontal':
        var diff = this._dragStartPosition[0] - pos[0];
        this.updateFromDrag(diff, this.dragResistance);
        break;
      case 'vertical':
      default:
        var diff = pos[1] - this._dragStartPosition[1];
        this.updateFromDrag(diff, this.dragResistance);
        break;
    }
    this._input.dispatchEvent(new InputEvent('change'));
  }

  finalizeDrag(pos) {
    switch(this.dragMode){
      case 'angular':
        break;
      case 'horizontal':
        var diff = this._dragStartPosition[0] - pos[0];
        this.updateFromDrag(diff, this.dragResistance);
        break;
      case 'vertical':
      default:
        var diff = pos[1] - this._dragStartPosition[1];
        this.updateFromDrag(diff, this.dragResistance);
        break;
    }
    
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

  smooth(expandedValue){
    if((this._prevValue - expandedValue) > this.smoothingThreshold ||
       (this._prevValue - expandedValue) < (this.smoothingThreshold * -1)){
      var diff = (expandedValue - this._prevValue);
      expandedValue = this._prevValue + diff/this.smoothingFactor;
      this._prevValue = expandedValue;
    }
    return expandedValue;
  }

  updateFromNormalizedValue(normalizedValue){
    var expandedValue = this.expandNormalizedValue(normalizedValue);
    if(this.smoothing){
      expandedValue = this.smooth(expandedValue);
      normalizedValue = this.normalizeValue(expandedValue);
    }

    this._input.value = expandedValue;
    this.updateVisuals(normalizedValue, expandedValue);
  }

  // utils
  expandNormalizedValue(val){
    var min = parseFloat(this._input.min);
    var max = parseFloat(this._input.max);
    return Math.min(val * (max-min), max);
  }

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

  findCenter(obj){
    var left = obj.offsetLeft;
    var top = obj.offsetTop;
    var height = obj.offsetHeight;
    var width = obj.offsetWidth;
    while (obj = obj.offsetParent){
      left += obj.offsetLeft;
      top += obj.offsetTop;
    }
    return [left + Math.floor(width/2), top + Math.floor(height/2)]
  }

  bearing(pos){
    var TWOPI = 6.2831853071795865;

    //This constant is used to convert radians into css turns
    //1 Turn = 2pi rad = 360 deg
    //Turns have the huge advantage that the value is already normalized
    var RAD2TURN = 0.159154943091895;
    
    var deltaX = pos[0] - this._center[0];
    var deltaY = pos[1] - this._center[1];
    
    var theta = Math.atan2(-deltaX, deltaY);

    if (theta < 0.0)
      theta += TWOPI;

    return theta * RAD2TURN;
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
