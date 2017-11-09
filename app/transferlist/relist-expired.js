/* globals
GM_notification
window
enums gNavManager
*/

import { BaseScript, SettingsEntry, Queue } from '../core';
import { Store, TransferMarket, Logger, priceTiers, utils } from '../../fut';

export class RelistAuctionsSettings extends SettingsEntry {
  static id = 'relist-auctions';
  constructor() {
    super('relist-auctions', 'Relist expired auctions automatically', null);
    this.addSetting('Interval in seconds', 'interval', 300);
    this.addSetting('Relist at BIN price', 'relist-bin-price', true);
    this.addSettingUnder('relist-bin-price', 'Start price percentage (0 to 100%)', 'relist-bin-price-start', 90);
    this.addSettingUnder('relist-bin-price', 'Buy now price percentage (0 to 100%)', 'relist-bin-price-buynow', 110);
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
    const unsoldItems = tradepile
      .filter(d => d.state === enums.ItemState.FREE && d._auction.buyNowPrice > 0);
    if (unsoldItems.length > 0) {
      try {
        const settings = this.getSettings();
        await this._market.navigateToTransferList();
        if (!settings['relist-bin-price']) {
          await this._market.relistAllItems();
        } else {
          /* eslint-disable no-await-in-loop */
          for (const item of unsoldItems) { // eslint-disable-line no-restricted-syntax
            if (item.type === 'player') {
              const minimumBin = await this._market.searchMinBuy(item, 3);

              await this._market.navigateToTransferList();

              const listPrice = priceTiers.determineListPrice(
                minimumBin * (settings['relist-bin-price-start'] / 100),
                minimumBin * (settings['relist-bin-price-buynow'] / 100),
              );

              // TODO: variable duration?
              await this._market.listItem(
                item,
                listPrice.start,
                listPrice.buyNow,
                1 * 60 * 60,
              );
            } else {
              await this._market.listItem(
                item,
                item._auction.startingBid,
                item._auction.buyNowPrice,
                1 * 60 * 60,
              );
            }
            await utils.sleep(3000); // wait a few seconds before listing the next item
          }
          /* eslint-enable no-await-in-loop */
        }

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
