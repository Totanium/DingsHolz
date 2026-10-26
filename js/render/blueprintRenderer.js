'use strict';

/**
 * Erzeugt den druckbaren Bauplan als HTML:
 * Eckdaten, Stückliste, Übersicht der Abschnitte und je Abschnitt ein Raster
 * mit Holz-Nummer und Richtungspfeil in jeder Zelle.
 */
class BlueprintRenderer {
  /** Zellen pro Abschnitt (Kantenlänge), damit jeder Abschnitt auf eine Druckseite passt. */
  static SECTION_SIZE = 20;

  constructor(container) {
    this.container = container;
  }

  render(plan, woods, settings) {
    this.container.replaceChildren(
      el('h2', {}, 'Bauplan'),
      this.renderInfo(plan, settings),
      this.renderPartsList(plan, woods),
      this.renderOverview(plan),
      ...this.sectionsOf(plan).map((section) => this.renderSection(plan, section)),
    );
  }

  clear(message) {
    this.container.replaceChildren(el('p', { class: 'hint' }, message));
  }

  renderInfo(plan, settings) {
    const items = [
      `Tischplatte: ${formatNumber(settings.tableWidth)} × ${formatNumber(settings.tableHeight)} cm`,
      `Teile: ${plan.columns} Spalten × ${plan.rows} Reihen = ${plan.cells.length} Stück `
        + `(Grundfläche ${formatNumber(settings.pieceSize)} × ${formatNumber(settings.pieceSize)} cm, `
        + `${formatNumber(settings.lowHeight)} cm niedrige / ${formatNumber(settings.highHeight)} cm hohe Seite)`,
      `Harzrand: links/rechts je ${formatNumber(settings.leftoverWidth / 2)} cm, `
        + `oben/unten je ${formatNumber(settings.leftoverHeight / 2)} cm`,
      'Lesart: Draufsicht. Spalten A, B, C … von links nach rechts, Reihen 1, 2, 3 … von oben nach unten.',
      'Jede Zelle: Holz-Nummer + Pfeil. Der Pfeil zeigt zur hohen Seite (Spitze) des Teils.',
    ];
    return el('ul', { class: 'bp-info' }, items.map((text) => el('li', {}, text)));
  }

  renderPartsList(plan, woods) {
    const counts = plan.countPieces();
    const header = el('tr', {}, [
      el('th', {}, 'Nr.'),
      el('th', {}, 'Holz'),
      ...Orientation.ALL.map((o) => el('th', { title: `Spitze ${o.label}` }, o.arrow)),
      el('th', {}, 'Gesamt'),
    ]);
    const rows = woods.map((wood) => {
      const entry = counts.get(wood.code) ?? { total: 0, byOrientation: new Map() };
      return el('tr', {}, [
        el('td', {}, this.woodBadge(wood)),
        el('td', {}, wood.name),
        ...Orientation.ALL.map((o) => el('td', { class: 'num' }, entry.byOrientation.get(o.key) ?? 0)),
        el('td', { class: 'num total' }, entry.total),
      ]);
    });
    const footer = el('tr', { class: 'sum' }, [
      el('td', { colspan: 2 + Orientation.ALL.length }, 'Summe'),
      el('td', { class: 'num total' }, plan.cells.length),
    ]);
    return el('section', { class: 'bp-block' }, [
      el('h3', {}, 'Stückliste'),
      el('table', { class: 'bp-parts' }, [el('thead', {}, header), el('tbody', {}, [...rows, footer])]),
    ]);
  }

  renderOverview(plan) {
    const sections = this.sectionsOf(plan);
    const perRow = Math.ceil(plan.columns / BlueprintRenderer.SECTION_SIZE);
    const rows = [];
    for (let i = 0; i < sections.length; i += perRow) {
      rows.push(el('tr', {}, sections.slice(i, i + perRow).map((s) => el('td', {}, [
        el('strong', {}, `Abschnitt ${s.number}`),
        el('br'),
        this.rangeLabel(s),
      ]))));
    }
    return el('section', { class: 'bp-block' }, [
      el('h3', {}, 'Übersicht der Abschnitte'),
      el('table', { class: 'bp-overview' }, el('tbody', {}, rows)),
    ]);
  }

  renderSection(plan, section) {
    const { x0, x1, y0, y1 } = section;
    const head = el('tr', {}, [el('th'), ...this.range(x0, x1).map((x) => el('th', {}, TablePlan.columnLabel(x)))]);
    const body = this.range(y0, y1).map((y) => el('tr', {}, [
      el('th', {}, y + 1),
      ...this.range(x0, x1).map((x) => this.renderCell(plan.cellAt(x, y), x, y)),
    ]));
    return el('section', { class: 'bp-section' }, [
      el('h3', {}, `Abschnitt ${section.number} – ${this.rangeLabel(section)}`),
      el('table', { class: 'bp-grid' }, [el('thead', {}, head), el('tbody', {}, body)]),
    ]);
  }

  renderCell({ wood, orientation }, x, y) {
    return el('td', {
      style: { background: wood.hex, color: this.textColorOn(wood) },
      title: `${TablePlan.position(x, y)}: ${wood.name}, Spitze ${orientation.label}`,
    }, [el('span', { class: 'code' }, wood.code), el('span', { class: 'arrow' }, orientation.arrow)]);
  }

  woodBadge(wood) {
    return el('span', { class: 'wood-badge', style: { background: wood.hex, color: this.textColorOn(wood) } }, wood.code);
  }

  textColorOn(wood) {
    return Color.luminance(wood.rgb) > 0.55 ? '#1d1209' : '#fff8ee';
  }

  /** Teilt das Raster in Abschnitte von SECTION_SIZE × SECTION_SIZE (zeilenweise nummeriert). */
  sectionsOf(plan) {
    const size = BlueprintRenderer.SECTION_SIZE;
    const sections = [];
    for (let y0 = 0; y0 < plan.rows; y0 += size) {
      for (let x0 = 0; x0 < plan.columns; x0 += size) {
        sections.push({
          number: sections.length + 1,
          x0,
          x1: Math.min(plan.columns, x0 + size),
          y0,
          y1: Math.min(plan.rows, y0 + size),
        });
      }
    }
    return sections;
  }

  rangeLabel({ x0, x1, y0, y1 }) {
    return `Spalten ${TablePlan.columnLabel(x0)}–${TablePlan.columnLabel(x1 - 1)}, Reihen ${y0 + 1}–${y1}`;
  }

  range(from, to) {
    return Array.from({ length: to - from }, (_, i) => from + i);
  }
}
