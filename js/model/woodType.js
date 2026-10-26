'use strict';

/** Eine Holzart: Nummer (steht im Bauplan), Name und Grundfarbe. */
class WoodType {
  constructor(code, name, hex) {
    this.code = code;
    this.name = name;
    this.hex = hex;
    this.rgb = Color.hexToRgb(hex);
    Object.freeze(this);
  }
}

/** Standard-Hölzer, von hell nach dunkel. Name und Farbe sind in der App änderbar. */
const DEFAULT_WOODS = Object.freeze([
  new WoodType(1, 'Weißtanne', '#e3cfa8'),
  new WoodType(2, 'Eiche', '#c09257'),
  new WoodType(3, 'Lärche', '#a8673c'),
  new WoodType(4, 'Sature', '#7d4128'),
  new WoodType(5, 'Kebony', '#4a382c'),
]);
