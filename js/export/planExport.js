'use strict';

/** Exporte: Teileliste als CSV (für Excel), Vorschau als PNG. */
const PlanExport = Object.freeze({
  /** Hohe Auflösung für den PNG-Export (Pixel pro Teil). */
  PNG_CELL_SIZE: 24,

  toCsv(plan) {
    const lines = [['Position', 'Spalte', 'Reihe', 'Holz-Nr', 'Holz', 'Spitze zeigt nach'].join(';')];
    for (let y = 0; y < plan.rows; y++) {
      for (let x = 0; x < plan.columns; x++) {
        const { wood, orientation } = plan.cellAt(x, y);
        lines.push([
          TablePlan.position(x, y), TablePlan.columnLabel(x), y + 1, wood.code, wood.name, orientation.label,
        ].join(';'));
      }
    }
    return lines.join('\r\n');
  },

  downloadCsv(plan, filename) {
    // BOM, damit Excel Umlaute korrekt erkennt
    PlanExport.download(filename, new Blob(['﻿' + PlanExport.toCsv(plan)], { type: 'text/csv' }));
  },

  downloadPng(plan, renderer, filename) {
    const canvas = document.createElement('canvas');
    renderer.render(canvas, plan, PlanExport.PNG_CELL_SIZE);
    canvas.toBlob((blob) => PlanExport.download(filename, blob), 'image/png');
  },

  download(filename, blob) {
    const url = URL.createObjectURL(blob);
    el('a', { href: url, download: filename }).click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
});
