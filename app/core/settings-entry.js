import { Database } from './db';

export class SettingsEntry {
  constructor(id, name) {
    const settings = Database.getJson(`settings:${id}`, {});

    this.id = id;
    this.name = name;
    this.isActive = settings.isActive ? settings.isActive : false;
    this.settings = [];
  }

  toggle() {
    this.isActive = !this.isActive;

    const settings = Database.getJson(`settings:${this.id}`, {});
    settings.isActive = this.isActive;
    Database.setJson(`settings:${this.id}`, settings);
  }

  addSetting(label, key, defaultValue, cb) {
    const settings = Database.getJson(`settings:${this.id}`, {});

    settings[key] = settings[key] ? settings[key] : defaultValue;
    Database.setJson(`settings:${this.id}`, settings);

    this.settings.push({
      label,
      key,
      value: settings[key] ? settings[key] : defaultValue,
      callback: cb,
      subsettings: [],
    });
  }

  addSettingUnder(underKey, label, key, defaultValue, cb) {
    const settings = Database.getJson(`settings:${this.id}`, {});
    settings[key] = settings[key] ? settings[key] : defaultValue;
    Database.setJson(`settings:${this.id}`, settings);

    const setting = this.settings.find(s => s.key === underKey);
    setting.subsettings.push({
      label,
      key,
      value: settings[key] ? settings[key] : defaultValue,
      callback: cb,
    });
  }

  changeValue(key, value) {
    const settings = Database.getJson(`settings:${this.id}`, {});

    settings[key] = value;

    Database.setJson(`settings:${this.id}`, settings);
  }
}
