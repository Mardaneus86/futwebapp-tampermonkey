/* globals
GM_notification
window
enums gNavManager
*/

import { BaseScript, SettingsEntry, Queue } from '../core';
import { Store, TransferMarket, Logger } from '../../fut';

export class RelistAuctionsSettings extends SettingsEntry {
  static id = 'relist-auctions';
  constructor() {
    super('relist-auctions', 'Relist expired auctions automatically', null);
    this.addSetting('Interval in seconds', 'interval', 300);
  }
}

class RelistAuctions extends BaseScript {
  constructor() {
    super(RelistAuctionsSettings.id);

    this._logger = new Logger();
    this._store = new Store();
    this._market = new TransferMarket();
  }

  activate(state) {
    super.activate(state);

    this._start();
  }

  deactivate(state) {
    super.deactivate(state);

    this._stop();
  }

  _start() {
    this._running = true;
    setTimeout(() => {
      if (this._running) {
        Queue.getInstance().add('Remove sold auctions', async () => {
          await this._handleRelistAuctions(await this._store.getTradePile());
        });
      }
    }, this.getSettings().interval * 1000);
  }

  _stop() {
    this._running = false;
  }

  async _handleRelistAuctions(tradepile) {
    const soldItems = tradepile
      .filter(d => d.state === enums.ItemState.FREE && d._auction.buyNowPrice > 0);
    if (soldItems.length > 0) {
      try {
        await this._market.relistAllItems();

        // Refresh screen if we are on the transfer list screen
        if (gNavManager.getCurrentScreenController()._controller.className === 'TransferListLandscapeViewController') {
          gNavManager.getCurrentScreenController()._controller._listController._requestItems();
        }

        GM_notification({
          text: 'Relisted expired auctions',
          title: 'FUT 18 Web App',
          timeout: 5000,
          onclick: () => window.focus(),
        });
      } catch (err) {
        this._logger.log(`Cannot execute - ${err.message}`, 'Relist Expired');
      }
    }

    setTimeout(() => {
      if (this._running) {
        Queue.getInstance().add('Remove sold auctions', async () => {
          await this._handleRelistAuctions(await this._store.getTradePile());
        });
      }
    }, this.getSettings().interval * 1000);
  }
}

new RelistAuctions(); // eslint-disable-line no-new
