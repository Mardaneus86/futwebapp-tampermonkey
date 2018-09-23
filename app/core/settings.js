import EventEmitter from 'event-emitter-es6';

import analytics from './analytics';

export class Settings extends EventEmitter {
  constructor() {
    super();
    this._entries = [];
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Settings();
    }

    return this._instance;
  }

  /**
   *
   * @param {SettingsEntry} entry The entry for the settings
   */
  registerEntry(entry) {
    this._entries.push(entry);

    if (entry.isActive) {
      this._emitEvent(entry);
    }
  }

  getEntries() {
    return this._entries;
  }

  toggleEntry(id) {
    const entries = this._entries.filter(e => e.id === id);
    if (!entries || entries.length === 0) {
      return;
    }

    entries[0].toggle();

    analytics.trackEvent('Settings', `Toggle setting ${id}`, entries[0].isActive);
    this._emitEvent(entries[0]);
  }

  _emitEvent(entry) {
    if (entry.isActive) {
      this.emit('entry-enabled', entry);
    } else {
      this.emit('entry-disabled', entry);
    }
  }
}
