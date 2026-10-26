# Holztisch-Planer

Macht aus einem Bild einen Bauplan für eine Tischplatte aus schräg abgeschnittenen Holzteilen.
Die Hohlräume werden mit Harz aufgefüllt. Von oben sieht man das Bild aus Holz.

## Starten

`index.html` per Doppelklick im Browser öffnen. Es wird nichts installiert und kein Server gebraucht.

## So funktioniert es

1. **Raster:** Tischmaße ÷ Kantenlänge eines Teils = Anzahl Spalten und Reihen. Was nicht aufgeht, bleibt als Harzrand.
2. **Bildanalyse** (`ImageSampler`): Das Bild wird auf das Tischformat zugeschnitten. Pro Zelle werden die mittlere Farbe und die Kantenrichtung (Sobel) ermittelt.
3. **Lichtmodell** (`ToneModel`): Eine schräge Fläche wirkt heller, wenn sie zum Licht zeigt. Aus 5 Hölzern × 4 Richtungen entstehen 20 Farbtöne.
4. **Musterwahl** (`PatternGenerator`): Für jede Zelle gewinnt der Ton mit den geringsten Kosten:
   - Farbabstand zum Bild
   - Konturen: An Kanten zeigt die Spitze möglichst zur helleren Bildseite (Relief-Effekt).
   - Ruhe: Ein Richtungswechsel gegenüber den Nachbarn kostet etwas.
   - Optional verteilt Dithering den Farbfehler auf die Nachbarzellen.
5. **Ausgabe:** Vorschau (`PreviewRenderer`), Bauplan zum Drucken (`BlueprintRenderer`), CSV/PNG (`PlanExport`).

Im Bauplan steht in jeder Zelle die **Holz-Nummer** und ein **Pfeil**. Der Pfeil zeigt zur **hohen Seite** des Teils.

## Aufbau

```
js/
  core/     Color (Farbumrechnung), dom (Element-Helfer)
  model/    Orientation, WoodType, Settings, TablePlan – reine Daten
  engine/   ImageCrop, ImageSampler, ToneModel, PatternGenerator – Berechnung, kein UI
  render/   PreviewRenderer (Canvas), BlueprintRenderer (HTML-Bauplan)
  export/   PlanExport (CSV, PNG)
  ui/       SettingsForm, WoodPaletteEditor, TonePaletteView, SettingsStore
  app.js    verbindet alles (Eingabe → Berechnung → Anzeige)
```

Jede Klasse hat genau eine Aufgabe. Die Berechnung (`engine/`) kennt keine Oberfläche, die Darstellung (`render/`) berechnet nichts.
Ein neues Lichtmodell oder eine neue Auswahlstrategie lässt sich deshalb austauschen, ohne den Rest anzufassen.

Die Skripte sind bewusst klassische `<script>`-Dateien statt ES-Module. Module laden bei `file://` nicht, und so reicht ein Doppelklick zum Starten.
