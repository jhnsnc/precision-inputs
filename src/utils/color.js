// num-hexstring
export function hexstringToNum(hex) {
  if (!hex.length) return null;

  if (hex[0] === '#') {
    hex = hex.substring(1);
  }
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) return null;

  return (parseInt(hex.substring(0,2), 16) << 16) + // r
         (parseInt(hex.substring(2,4), 16) << 8) + // g
         parseInt(hex.substring(4,6), 16); // b
}

export function numToHexstring(val) {
  return '#' + (val & 0xffffff).toString(16);
}

// assumes colorA and colorB are ints representing a color value
export function mixColors(colorA, colorB, mixAmount) {
  const r = Math.round( (1 - mixAmount) * ((colorA >> 16) & 0xff) + mixAmount * ((colorB >> 16) & 0xff) );
  const g = Math.round( (1 - mixAmount) * ((colorA >> 8) & 0xff) + mixAmount * ((colorB >> 8) & 0xff) );
  const b = Math.round( (1 - mixAmount) * (colorA & 0xff) + mixAmount * (colorB & 0xff) );
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
