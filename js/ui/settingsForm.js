'use strict';

/**
 * Verbindet alle Eingabefelder mit data-setting="…" mit einem Settings-Objekt.
 * Schieberegler zeigen ihren Wert in einem <output> im selben Label an.
 */
class SettingsForm {
  constructor(root, initial, onChange) {
    this.fields = [...root.querySelectorAll('[data-setting]')];
    this.write(initial);
    for (const field of this.fields) {
      field.addEventListener('input', () => {
        this.showValue(field);
        onChange();
      });
    }
  }

  read() {
    const values = {};
    for (const field of this.fields) {
      values[field.dataset.setting] = field.type === 'checkbox' ? field.checked : Number(field.value);
    }
    return new Settings(values);
  }

  write(settings) {
    for (const field of this.fields) {
      const value = settings[field.dataset.setting];
      if (field.type === 'checkbox') field.checked = value;
      else field.value = value;
      this.showValue(field);
    }
  }

  showValue(field) {
    const output = field.closest('label')?.querySelector('output');
    if (output) output.textContent = field.value;
  }
}
