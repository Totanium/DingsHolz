'use strict';

/**
 * Steuert den Ablauf: Eingaben lesen → Bild analysieren → Muster berechnen → Vorschau und Bauplan zeigen.
 * Die eigentliche Logik steckt in den einzelnen Klassen; App verbindet sie nur.
 */
class App {
  /** Zielbreite der Vorschau in Pixeln. */
  static PREVIEW_WIDTH = 960;
  static UPDATE_DELAY_MS = 150;

  constructor(dom) {
    this.dom = dom;
    this.image = null;
    this.plan = null;

    this.store = new SettingsStore();
    this.sampler = new ImageSampler();
    this.preview = new PreviewRenderer();
    this.blueprint = new BlueprintRenderer(dom.blueprint);
    this.toneView = new TonePaletteView(dom.toneList);
    this.settingsForm = new SettingsForm(dom.controls, this.store.loadSettings(), () => this.scheduleUpdate());
    this.woodEditor = new WoodPaletteEditor(dom.woodList, this.store.loadWoods(), () => this.scheduleUpdate());

    this.bindEvents();
    this.update();
  }

  bindEvents() {
    const { dom } = this;
    dom.imageInput.addEventListener('change', () => this.loadImage(dom.imageInput.files[0]));
    dom.dropZone.addEventListener('dragover', (event) => event.preventDefault());
    dom.dropZone.addEventListener('drop', (event) => {
      event.preventDefault();
      this.loadImage(event.dataTransfer.files[0]);
    });
    dom.printButton.addEventListener('click', () => window.print());
    dom.csvButton.addEventListener('click', () => PlanExport.downloadCsv(this.plan, 'bauplan.csv'));
    dom.pngButton.addEventListener('click', () => PlanExport.downloadPng(this.plan, this.preview, 'tisch-vorschau.png'));
  }

  loadImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        this.image = image;
        this.update();
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  scheduleUpdate() {
    clearTimeout(this.updateTimer);
    this.updateTimer = setTimeout(() => this.update(), App.UPDATE_DELAY_MS);
  }

  update() {
    const settings = this.settingsForm.read();
    const woods = this.woodEditor.read();
    this.store.save(settings, woods);

    const errors = settings.validate();
    this.showSummary(settings, errors);
    if (errors.length) return this.showEmpty('Bitte die Eingaben korrigieren.');

    const tones = new ToneModel(settings).createTones(woods);
    this.toneView.render(tones);
    if (!this.image) return this.showEmpty('Lade ein Bild, um den Bauplan zu erzeugen.');

    const target = this.sampler.sample(this.image, settings.columns, settings.rows);
    this.plan = new PatternGenerator(tones, settings).generate(target);
    this.showResult(woods, settings);
  }

  showResult(woods, settings) {
    const { dom, plan } = this;
    const cellSize = Math.max(2, Math.floor(App.PREVIEW_WIDTH / plan.columns));
    this.preview.render(dom.previewCanvas, plan, cellSize);

    dom.originalCanvas.width = dom.previewCanvas.width;
    dom.originalCanvas.height = dom.previewCanvas.height;
    ImageCrop.draw(dom.originalCanvas.getContext('2d'), this.image, dom.originalCanvas.width, dom.originalCanvas.height);

    this.blueprint.render(plan, woods, settings);
    this.setResultVisible(true);
  }

  showEmpty(message) {
    this.plan = null;
    this.blueprint.clear(message);
    this.setResultVisible(false);
  }

  setResultVisible(visible) {
    this.dom.canvases.hidden = !visible;
    for (const button of [this.dom.printButton, this.dom.csvButton, this.dom.pngButton]) button.disabled = !visible;
  }

  showSummary(settings, errors) {
    const { summary } = this.dom;
    summary.classList.toggle('error', errors.length > 0);
    summary.textContent = errors.length
      ? errors.join(' ')
      : `${settings.columns} × ${settings.rows} = ${settings.columns * settings.rows} Teile`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const byId = (id) => document.getElementById(id);
  new App({
    controls: byId('controls'),
    imageInput: byId('imageInput'),
    dropZone: byId('dropZone'),
    woodList: byId('woodList'),
    toneList: byId('toneList'),
    summary: byId('summary'),
    canvases: byId('canvases'),
    originalCanvas: byId('originalCanvas'),
    previewCanvas: byId('previewCanvas'),
    blueprint: byId('blueprint'),
    printButton: byId('printButton'),
    csvButton: byId('csvButton'),
    pngButton: byId('pngButton'),
  });
});
