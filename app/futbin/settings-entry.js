import { SettingsEntry } from '../core';

export class FutbinSettings extends SettingsEntry {
  static id = 'futbin';
  constructor() {
    super('futbin', 'FutBIN integration');

    this.addSetting('Show link to player page', 'show-link-to-player', false, 'checkbox');
    this.addSetting('Mark bargains', 'show-bargains', false, 'checkbox');
  }
}
