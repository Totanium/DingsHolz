'use strict';

/** Alle Einstellungen (Maße in cm, Winkel in Grad) plus daraus abgeleitete Größen. */
class Settings {
  static DEFAULTS = Object.freeze({
    tableWidth: 120,
    tableHeight: 80,
    pieceSize: 2,
    lowHeight: 2,
    highHeight: 4,
    // nicht genau diagonal (315°), sonst wirken je zwei Richtungen gleich hell → weniger Töne
    lightAzimuth: 330,
    lightElevation: 45,
    contourWeight: 15,
    coherenceWeight: 3,
    dithering: true,
  });

  static MAX_PIECES = 20000;

  constructor(values = {}) {
    for (const [key, fallback] of Object.entries(Settings.DEFAULTS)) {
      this[key] = values[key] ?? fallback;
    }
    Object.freeze(this);
  }

  get columns() {
    return Math.floor(this.tableWidth / this.pieceSize + 1e-9);
  }

  get rows() {
    return Math.floor(this.tableHeight / this.pieceSize + 1e-9);
  }

  /** Breite des Harzrands, der übrig bleibt, wenn die Tischmaße kein Vielfaches der Teilgröße sind. */
  get leftoverWidth() {
    return this.tableWidth - this.columns * this.pieceSize;
  }

  get leftoverHeight() {
    return this.tableHeight - this.rows * this.pieceSize;
  }

  /** Steigung der schrägen Oberseite (Höhenunterschied / Breite). */
  get slope() {
    return (this.highHeight - this.lowHeight) / this.pieceSize;
  }

  /** Liefert eine Liste verständlicher Fehlermeldungen (leer = alles in Ordnung). */
  validate() {
    const errors = [];
    if (!(this.tableWidth > 0 && this.tableHeight > 0)) errors.push('Tischmaße müssen größer als 0 sein.');
    if (!(this.pieceSize > 0)) errors.push('Die Grundfläche eines Teils muss größer als 0 sein.');
    if (!(this.lowHeight >= 0 && this.highHeight > this.lowHeight)) {
      errors.push('Die hohe Seite muss höher sein als die niedrige Seite.');
    }
    if (errors.length) return errors;

    if (this.columns < 1 || this.rows < 1) errors.push('Der Tisch ist kleiner als ein einzelnes Teil.');
    if (this.columns * this.rows > Settings.MAX_PIECES) {
      errors.push(`Zu viele Teile (${this.columns * this.rows}). Maximal ${Settings.MAX_PIECES}.`);
    }
    return errors;
  }

  toJSON() {
    return Object.fromEntries(Object.keys(Settings.DEFAULTS).map((key) => [key, this[key]]));
  }
}
