'use strict';

/**
 * Farb-Hilfsfunktionen.
 * RGB-Werte sind Objekte { r, g, b } (0–255), Lab-Werte { l, a, b }.
 * Lab wird für Farbvergleiche genutzt, weil Abstände dort ungefähr dem menschlichen Sehen entsprechen.
 */
const Color = Object.freeze({
  hexToRgb(hex) {
    const value = parseInt(hex.replace('#', ''), 16);
    return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
  },

  rgbToHex({ r, g, b }) {
    return '#' + [r, g, b]
      .map((channel) => Math.round(Color.clampChannel(channel)).toString(16).padStart(2, '0'))
      .join('');
  },

  clampChannel(value) {
    return Math.min(255, Math.max(0, value));
  },

  /** Helligkeit skalieren (Faktor 1 = unverändert). */
  scale({ r, g, b }, factor) {
    return {
      r: Color.clampChannel(r * factor),
      g: Color.clampChannel(g * factor),
      b: Color.clampChannel(b * factor),
    };
  },

  /** Wahrgenommene Helligkeit 0–1 (für Kantenerkennung und Textkontrast). */
  luminance({ r, g, b }) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  },

  rgbToLab({ r, g, b }) {
    const toLinear = (channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const lr = toLinear(r);
    const lg = toLinear(g);
    const lb = toLinear(b);

    // sRGB → XYZ (D65), normiert auf den Weißpunkt
    const x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
    const y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
    const z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;

    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const fx = f(x);
    const fy = f(y);
    const fz = f(z);
    return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
  },

  /**
   * Farbabstand (CIE76): ca. 2 = kaum sichtbar, ab ca. 10 deutlich anders.
   * chromaWeight < 1 bewertet Unterschiede im Farbton schwächer als in der Helligkeit.
   */
  distance(p, q, chromaWeight = 1) {
    return Math.hypot(p.l - q.l, chromaWeight * (p.a - q.a), chromaWeight * (p.b - q.b));
  },
});
