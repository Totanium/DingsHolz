'use strict';

/**
 * Wählt für jede Rasterzelle den passenden Farbton (Holz + Drehung).
 * Für jeden Kandidaten werden Kosten berechnet, der günstigste gewinnt:
 *  - Farbe:       Abstand zwischen Bildfarbe und Farbton
 *  - Kontur:      an Kanten soll die hohe Seite zur helleren Bildseite zeigen (Relief-Effekt)
 *  - Ruhe:        Abweichung von der Drehung der Nachbarn kostet etwas (weniger Unruhe)
 * Optional verteilt Dithering den Farbfehler auf Nachbarzellen (feinere Verläufe).
 */
class PatternGenerator {
  static DITHER_STRENGTH = 0.8;

  /**
   * Gewicht des Farbtons gegenüber der Helligkeit beim Vergleich.
   * Holz kann z. B. kein Blau – deshalb zählt die Helligkeit mehr, sonst würden Mitteltöne ungenutzt bleiben.
   */
  static CHROMA_WEIGHT = 0.4;

  /** Floyd-Steinberg: [dx, dy, Anteil] */
  static FLOYD_STEINBERG = Object.freeze([
    [1, 0, 7 / 16],
    [-1, 1, 3 / 16],
    [0, 1, 5 / 16],
    [1, 1, 1 / 16],
  ]);

  constructor(tones, { contourWeight, coherenceWeight, dithering }) {
    this.tones = tones;
    this.contourWeight = contourWeight;
    this.coherenceWeight = coherenceWeight;
    this.dithering = dithering;
  }

  generate(target) {
    const { columns, rows } = target;
    const wanted = target.cells.map((cell) => ({ ...cell.lab }));
    const cells = new Array(columns * rows);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const i = y * columns + x;
        const neighbours = [x > 0 ? cells[i - 1] : null, y > 0 ? cells[i - columns] : null]
          .filter(Boolean)
          .map((tone) => tone.orientation);

        const tone = this.bestTone(wanted[i], target.cells[i].gradient, neighbours);
        cells[i] = tone;
        if (this.dithering) this.diffuseError(wanted, columns, rows, x, y, tone.lab);
      }
    }
    return new TablePlan(columns, rows, cells);
  }

  bestTone(lab, gradient, neighbours) {
    let best = null;
    let bestCost = Infinity;
    for (const tone of this.tones) {
      const cost = this.cost(tone, lab, gradient, neighbours);
      if (cost < bestCost) {
        best = tone;
        bestCost = cost;
      }
    }
    return best;
  }

  cost(tone, lab, gradient, neighbours) {
    const colour = Color.distance(lab, tone.lab, PatternGenerator.CHROMA_WEIGHT);
    const contour = this.contourWeight * PatternGenerator.contourPenalty(tone.orientation, gradient);
    const differing = neighbours.filter((orientation) => orientation !== tone.orientation).length;
    const coherence = neighbours.length ? (this.coherenceWeight * differing) / neighbours.length : 0;
    return colour + contour + coherence;
  }

  /** 0 = hohe Seite zeigt zur helleren Bildseite (oder keine Kante), bis 1 = genau falsch herum an starker Kante. */
  static contourPenalty(orientation, gradient) {
    const alignment = orientation.dx * gradient.x + orientation.dy * gradient.y;
    return (gradient.magnitude * (1 - alignment)) / 2;
  }

  /** Verteilt die Differenz zwischen Wunsch und gewähltem Farbton auf die noch offenen Nachbarzellen. */
  diffuseError(wanted, columns, rows, x, y, chosen) {
    const actual = wanted[y * columns + x];
    const k = PatternGenerator.DITHER_STRENGTH;
    const error = { l: (actual.l - chosen.l) * k, a: (actual.a - chosen.a) * k, b: (actual.b - chosen.b) * k };

    for (const [dx, dy, share] of PatternGenerator.FLOYD_STEINBERG) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= columns || ny >= rows) continue;
      const target = wanted[ny * columns + nx];
      target.l += error.l * share;
      target.a += error.a * share;
      target.b += error.b * share;
    }
  }
}
