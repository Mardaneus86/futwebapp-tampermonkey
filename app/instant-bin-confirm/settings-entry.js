import { SettingsEntry } from '../core';

export class InstantBinConfirmSettings extends SettingsEntry {
  static id = 'instant-bin-confirm';
  constructor() {
    super('instant-bin-confirm', 'Instantly confirm Buy It Now dialog');
  }
}
