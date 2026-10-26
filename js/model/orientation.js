'use strict';

/**
 * Drehrichtung eines Teils: auf welcher Seite die hohe Kante (Spitze) liegt.
 * dx/dy sind Plan-Koordinaten (x nach rechts, y nach unten), zeigen also zur hohen Seite.
 */
class Orientation {
  constructor(key, label, arrow, dx, dy) {
    this.key = key;
    this.label = label;
    this.arrow = arrow;
    this.dx = dx;
    this.dy = dy;
    Object.freeze(this);
  }
}

Orientation.NORTH = new Orientation('N', 'oben', '↑', 0, -1);
Orientation.EAST = new Orientation('O', 'rechts', '→', 1, 0);
Orientation.SOUTH = new Orientation('S', 'unten', '↓', 0, 1);
Orientation.WEST = new Orientation('W', 'links', '←', -1, 0);
Orientation.ALL = Object.freeze([
  Orientation.NORTH,
  Orientation.EAST,
  Orientation.SOUTH,
  Orientation.WEST,
]);
