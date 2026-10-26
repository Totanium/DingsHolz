'use strict';

/** Bearbeitung der Holzarten: pro Holz Name und Farbe. */
class WoodPaletteEditor {
  constructor(container, woods, onChange) {
    this.rows = woods.map((wood) => this.createRow(wood, onChange));
    container.replaceChildren(...this.rows.map((row) => row.element));
  }

  createRow(wood, onChange) {
    const name = el('input', { type: 'text', value: wood.name, 'aria-label': `Name Holz ${wood.code}`, onInput: onChange });
    const color = el('input', { type: 'color', value: wood.hex, 'aria-label': `Farbe Holz ${wood.code}`, onInput: onChange });
    const element = el('div', { class: 'wood-row' }, [el('span', { class: 'wood-code' }, wood.code), name, color]);
    return { code: wood.code, name, color, element };
  }

  read() {
    return this.rows.map(({ code, name, color }) => new WoodType(code, name.value.trim() || `Holz ${code}`, color.value));
  }
}
