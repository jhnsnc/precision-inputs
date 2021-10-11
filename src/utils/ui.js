function getSupportedPropertyName(properties) {
  for (let i = 0; i < properties.length; i += 1)
    if (typeof document.body.style[properties[i]] !== 'undefined')
      return properties[i];
  return null;
}

export const getTransformProperty = () => getSupportedPropertyName([
    'transform', 'msTransform', 'webkitTransform', 'mozTransform', 'oTransform'
  ]);

export const isHtmlElement = el => (
  typeof HTMLElement === 'object' ? el instanceof HTMLElement :
  typeof el === 'object' && el !== null && el.nodeType === 1 && typeof el.nodeName === 'string'
);
