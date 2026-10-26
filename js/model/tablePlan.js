'use strict';

/**
 * Ergebnis der Berechnung: für jede Rasterzelle ein Farbton (Holz + Drehung).
 * Zellen liegen zeilenweise im Array: Index = y * columns + x.
 */
class TablePlan {
  constructor(columns, rows, cells) {
    this.columns = columns;
    this.rows = rows;
    this.cells = cells;
    Object.freeze(this);
  }

  cellAt(x, y) {
    return this.cells[y * this.columns + x];
  }

  /** Stückzahlen: Map<Holz-Nr, { total, byOrientation: Map<Richtungs-Key, Anzahl> }> */
  countPieces() {
    const counts = new Map();
    for (const { wood, orientation } of this.cells) {
      if (!counts.has(wood.code)) counts.set(wood.code, { total: 0, byOrientation: new Map() });
      const entry = counts.get(wood.code);
      entry.total += 1;
      entry.byOrientation.set(orientation.key, (entry.byOrientation.get(orientation.key) ?? 0) + 1);
    }
    return counts;
  }

  /** Spaltenbezeichnung wie in Tabellen: A … Z, AA, AB … */
  static columnLabel(index) {
    let label = '';
    for (let n = index + 1; n > 0; n = Math.floor((n - 1) / 26)) {
      label = String.fromCharCode(65 + ((n - 1) % 26)) + label;
    }
    return label;
  }

  static position(x, y) {
    return `${TablePlan.columnLabel(x)}${y + 1}`;
  }
}
