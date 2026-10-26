'use strict';

/**
 * Lichtmodell: Wie hell wirkt ein schräges Teil von oben?
 * Die Oberseite ist eine geneigte Ebene. Zeigt sie zum Licht, wirkt das Holz heller, sonst dunkler.
 * So entstehen aus 5 Hölzern × 4 Richtungen bis zu 20 Farbtöne.
 * Ein Farbton ist { wood, orientation, rgb, lab }.
 */
class ToneModel {
  /** Grundhelligkeit durch Streulicht, unabhängig von der Neigung. */
  static AMBIENT = 0.6;

  constructor(settings) {
    this.slope = settings.slope;
    this.light = ToneModel.lightVector(settings.lightAzimuth, settings.lightElevation);
  }

  /** Helligkeitsfaktor einer Drehrichtung; 1 entspricht einer flachen Oberfläche. */
  shadeFactor(orientation) {
    // Die Fläche steigt zur hohen Seite (dx, dy) an → ihre Normale kippt zur Gegenseite.
    const length = Math.hypot(this.slope, 1);
    const normal = {
      x: (-this.slope * orientation.dx) / length,
      y: (-this.slope * orientation.dy) / length,
      z: 1 / length,
    };
    const { x, y, z } = this.light;
    const lit = Math.max(0, normal.x * x + normal.y * y + normal.z * z) / z;
    return ToneModel.AMBIENT + (1 - ToneModel.AMBIENT) * lit;
  }

  createTones(woods) {
    return woods.flatMap((wood) => Orientation.ALL.map((orientation) => {
      const rgb = Color.scale(wood.rgb, this.shadeFactor(orientation));
      return Object.freeze({ wood, orientation, rgb, lab: Color.rgbToLab(rgb) });
    }));
  }

  /**
   * Einheitsvektor zur Lichtquelle.
   * Azimut: im Uhrzeigersinn ab „oben“ im Plan (315° = von links oben). Höhe: Winkel über der Tischfläche.
   */
  static lightVector(azimuthDeg, elevationDeg) {
    const azimuth = (azimuthDeg * Math.PI) / 180;
    const elevation = (elevationDeg * Math.PI) / 180;
    return {
      x: Math.sin(azimuth) * Math.cos(elevation),
      y: -Math.cos(azimuth) * Math.cos(elevation),
      z: Math.sin(elevation),
    };
  }
}
