'use strict';

/**
 * Zeichnet die Draufsicht des fertigen Tisches.
 * Jedes Teil bekommt einen Verlauf entlang der Schräge (tiefe Seite liegt unter mehr Harz → dunkler),
 * eine helle Kante an der Spitze, eine leichte Maserung und eine Harzfuge.
 */
class PreviewRenderer {
  static RESIN_COLOR = '#2b2119';
  static DEPTH_FACTOR = 0.82;
  static TOP_FACTOR = 1.12;
  /** Ab dieser Zellgröße (px) werden Details wie Fugen und Maserung gezeichnet. */
  static DETAIL_MIN_SIZE = 8;

  render(canvas, plan, cellSize) {
    canvas.width = plan.columns * cellSize;
    canvas.height = plan.rows * cellSize;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = PreviewRenderer.RESIN_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    plan.cells.forEach((tone, i) => {
      const left = (i % plan.columns) * cellSize;
      const top = Math.floor(i / plan.columns) * cellSize;
      this.drawPiece(ctx, tone, left, top, cellSize, i);
    });
  }

  drawPiece(ctx, tone, left, top, cellSize, seed) {
    const detailed = cellSize >= PreviewRenderer.DETAIL_MIN_SIZE;
    const gap = detailed ? Math.max(1, cellSize * 0.04) : 0;
    const size = cellSize - gap;
    const half = size / 2;
    const center = { x: left + gap / 2 + half, y: top + gap / 2 + half };
    const { dx, dy } = tone.orientation;

    const gradient = ctx.createLinearGradient(
      center.x - dx * half, center.y - dy * half,
      center.x + dx * half, center.y + dy * half,
    );
    gradient.addColorStop(0, Color.rgbToHex(Color.scale(tone.rgb, PreviewRenderer.DEPTH_FACTOR)));
    gradient.addColorStop(1, Color.rgbToHex(Color.scale(tone.rgb, PreviewRenderer.TOP_FACTOR)));
    ctx.fillStyle = gradient;
    ctx.fillRect(center.x - half, center.y - half, size, size);

    if (detailed) {
      this.drawGrain(ctx, tone.orientation, center, half, seed);
      this.drawRidge(ctx, tone.orientation, center, half);
    }
  }

  /** Feine Maserung entlang der Schräge; zufällig, aber pro Zelle immer gleich (kein Flackern). */
  drawGrain(ctx, { dx, dy }, center, half, seed) {
    const random = PreviewRenderer.seededRandom(seed);
    ctx.save();
    ctx.strokeStyle = 'rgba(40, 20, 5, 0.13)';
    ctx.lineWidth = Math.max(0.5, half / 18);
    ctx.beginPath();
    for (let k = 0; k < 4; k++) {
      const offset = (random() * 2 - 1) * half * 0.9;
      // Linie quer versetzt (senkrecht zur Schräge), verläuft aber entlang der Schräge
      const ox = center.x - dy * offset;
      const oy = center.y + dx * offset;
      ctx.moveTo(ox - dx * half, oy - dy * half);
      ctx.lineTo(ox + dx * half, oy + dy * half);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Helle Lichtkante an der hohen Seite – betont die Spitze. */
  drawRidge(ctx, { dx, dy }, center, half) {
    const edge = { x: center.x + dx * half, y: center.y + dy * half };
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 240, 215, 0.35)';
    ctx.lineWidth = Math.max(1, half / 8);
    ctx.beginPath();
    ctx.moveTo(edge.x + dy * half, edge.y - dx * half);
    ctx.lineTo(edge.x - dy * half, edge.y + dx * half);
    ctx.stroke();
    ctx.restore();
  }

  /** Einfacher deterministischer Zufallsgenerator (xorshift). */
  static seededRandom(seed) {
    let state = (Math.imul(seed + 1, 2654435761) >>> 0) || 1;
    return () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return (state >>> 0) / 4294967296;
    };
  }
}
