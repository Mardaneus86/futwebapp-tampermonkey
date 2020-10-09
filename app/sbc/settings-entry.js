/* eslint-disable no-restricted-syntax */
/* eslint linebreak-style: ["error", "windows"] */

import { SettingsEntry } from '../core';

export class SBCSettings extends SettingsEntry {
  static id = 'sbc-features';
  constructor() {
    super('sbc-features', 'Enable SBC Features');
  }
}
