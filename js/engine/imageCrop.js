'use strict';

/** Zuschnitt eines Bildes auf ein Seitenverhältnis („cover“: füllt die Fläche, Ränder werden abgeschnitten). */
const ImageCrop = Object.freeze({
  cover(sourceWidth, sourceHeight, targetAspect) {
    if (sourceWidth / sourceHeight > targetAspect) {
      const width = sourceHeight * targetAspect;
      return { x: (sourceWidth - width) / 2, y: 0, width, height: sourceHeight };
    }
    const height = sourceWidth / targetAspect;
    return { x: 0, y: (sourceHeight - height) / 2, width: sourceWidth, height };
  },

  /** Zeichnet den zugeschnittenen Bildausschnitt formatfüllend auf einen Canvas. */
  draw(ctx, image, width, height) {
    const crop = ImageCrop.cover(image.naturalWidth, image.naturalHeight, width / height);
    ctx.fillStyle = '#ffffff'; // transparente Bereiche werden weiß statt schwarz
    ctx.fillRect(0, 0, width, height);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  },
});
