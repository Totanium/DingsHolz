'use strict';

/** Zeigt alle verfügbaren Farbtöne (Holz × Richtung) – so sieht man, was das Licht aus jedem Holz macht. */
class TonePaletteView {
  constructor(container) {
    this.container = container;
  }

  render(tones) {
    this.container.replaceChildren(...tones.map((tone) => el('span', {
      class: 'tone',
      style: { background: Color.rgbToHex(tone.rgb), color: Color.luminance(tone.rgb) > 0.55 ? '#1d1209' : '#fff8ee' },
      title: `${tone.wood.name}, Spitze ${tone.orientation.label}`,
    }, `${tone.wood.code}${tone.orientation.arrow}`)));
  }
}
