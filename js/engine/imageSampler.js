'use strict';

/**
 * Zerlegt das Bild in das Tischraster.
 * Liefert pro Zelle die Zielfarbe (Lab) und den Helligkeitsgradienten:
 * { x, y } zeigt zur helleren Seite, magnitude (0–1) ist die Kantenstärke.
 */
class ImageSampler {
  /** Pixel pro Zellkante, die gemittelt werden (glättet Rauschen). */
  static SUBSAMPLES = 4;

  /** Sobel-Wert, ab dem eine Kante als „voll“ gilt (harter Schwarz-Weiß-Sprung ≈ 4). */
  static FULL_EDGE = 2;

  sample(image, columns, rows) {
    const n = ImageSampler.SUBSAMPLES;
    const pixels = this.readPixels(image, columns * n, rows * n);
    const colors = this.averageCells(pixels, columns, rows);
    const luminance = colors.map(Color.luminance);

    const cells = colors.map((rgb, i) => ({
      lab: Color.rgbToLab(rgb),
      gradient: this.gradientAt(luminance, columns, rows, i % columns, Math.floor(i / columns)),
    }));
    return { columns, rows, cells };
  }

  readPixels(image, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ImageCrop.draw(ctx, image, width, height);
    return ctx.getImageData(0, 0, width, height);
  }

  averageCells({ data, width }, columns, rows) {
    const n = ImageSampler.SUBSAMPLES;
    const count = n * n;
    const colors = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let sy = 0; sy < n; sy++) {
          for (let sx = 0; sx < n; sx++) {
            const i = ((y * n + sy) * width + (x * n + sx)) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
          }
        }
        colors.push({ r: r / count, g: g / count, b: b / count });
      }
    }
    return colors;
  }

  /** Sobel-Operator auf dem Helligkeitsraster (Ränder werden fortgesetzt). */
  gradientAt(luminance, columns, rows, x, y) {
    const at = (cx, cy) => {
      const clampedX = Math.min(columns - 1, Math.max(0, cx));
      const clampedY = Math.min(rows - 1, Math.max(0, cy));
      return luminance[clampedY * columns + clampedX];
    };
    const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1)
      - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
    const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1)
      - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);

    const length = Math.hypot(gx, gy);
    if (length < 1e-6) return { x: 0, y: 0, magnitude: 0 };
    return { x: gx / length, y: gy / length, magnitude: Math.min(1, length / ImageSampler.FULL_EDGE) };
  }
}
