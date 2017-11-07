/* globals
GM_xmlhttpRequest GM_notification GM_getValue GM_setValue
window $ document
repositories enums gNavManager
*/

import { BaseScript, SettingsEntry, Queue, Database, browser } from '../core';
import { Store } from '../../fut';

export class RemoveSoldAuctionsSettings extends SettingsEntry {
  static id = 'remove-sold-auctions';
  constructor() {
    super('remove-sold-auctions', 'Remove sold auctions automatically', null);
    this.addSetting('Interval in seconds', 'interval', 60);
    this.addSetting('IFTTT Key', 'ifttt-key', '');
  }
}

class RemoveSoldAuctions extends BaseScript {
  constructor() {
    super(RemoveSoldAuctionsSettings.id);

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this._observer = new MutationObserver(RemoveSoldAuctions._mutationHandler.bind(this));
  }

  activate(state) {
    super.activate(state);

    const obsConfig = {
      childList: true,
      characterData: true,
      attributes: false,
      subtree: true,
    };

    setTimeout(() => {
      this._observer.observe($(document)[0], obsConfig);
    }, 0);

    this._start();
  }

  deactivate(state) {
    super.deactivate(state);

    this._observer.disconnect();

    this._stop();
  }

  _start() {
    this._running = true;
    setTimeout(() => {
      if (this._running) {
        Queue.getInstance().add('Remove sold auctions', async () => {
          await this._handleExpiredAuctions(await new Store().getTradePile());
        });
      }
    }, this.getSettings().interval * 1000);
  }

  _stop() {
    this._running = false;
  }

  async _handleExpiredAuctions(tradepile) {
    const unsoldItems = tradepile.filter(d => d.state !== enums.ItemState.INVALID);

    if (unsoldItems.length > 0) {
      const lastSalePrices = JSON.parse(GM_getValue('auctionlastprices', '{}'));

      for (let j = 0; j < unsoldItems.length; j += 1) {
        if (!lastSalePrices[unsoldItems[j].id]) {
          lastSalePrices[unsoldItems[j].id] = {
            lastSalePrice: unsoldItems[j].lastSalePrice,
          };
        }
      }
      GM_setValue('auctionlastprices', JSON.stringify(lastSalePrices));
    }
    const savedSoldItems = Database.getJson('items-sold', []);
    const soldItems = tradepile.filter(d => d.state === enums.ItemState.INVALID);
    if (soldItems.length > 0) {
      for (let i = 0; i < soldItems.length; i += 1) {
        let lastSalePrice = 0;
        let lastSalePriceKnown = false;
        const lastSalePricesList = JSON.parse(GM_getValue('auctionlastprices', '{}'));
        const lastSalePriceO = lastSalePricesList[soldItems[i].id];
        if (!!lastSalePriceO) { // eslint-disable-line no-extra-boolean-cast
          lastSalePrice = lastSalePriceO.lastSalePrice; // eslint-disable-line prefer-destructuring
          lastSalePriceKnown = true;
        }
        // calculate 5% EA tax
        const profit = (soldItems[i]._auction.currentBid * 0.95) - lastSalePrice;
        if (soldItems[i].type === 'player') {
          const player = repositories.Item.getStaticDataByDefId(soldItems[i].resourceId);
          let playerName = 'Unknown player';
          if (player !== null) {
            playerName = `${player.name} (${player.rating})`;
          }
          savedSoldItems.push({
            type: 'player',
            name: playerName,
            boughtPrice: lastSalePrice,
            salePrice: soldItems[i]._auction.currentBid,
            profit,
          });
          GM_notification({
            text: `${playerName} sold for ${soldItems[i]._auction.currentBid}`,
            title: 'FUT 18 Web App',
            onclick: () => window.focus(),
          });

          this._sendToIFTTT(soldItems[i]._auction.currentBid, lastSalePriceKnown ? profit : '', {
            lastSalePrice: lastSalePriceKnown ? lastSalePrice : '',
            salePrice: soldItems[i]._auction.currentBid,
            name: playerName,
          });
        } else {
          savedSoldItems.push({
            type: soldItems[i].type,
            boughtPrice: lastSalePrice,
            salePrice: soldItems[i]._auction.currentBid,
            profit,
          });
          // TODO: can we get the item name?
          GM_notification({
            text: `${soldItems[i]._staticData.name} item sold for ${soldItems[i]._auction.currentBid}`,
            title: 'FUT 18 Web App',
            onclick: () => window.focus(),
          });
          this._sendToIFTTT(soldItems[i]._auction.currentBid, lastSalePriceKnown ? profit : '', {
            lastSalePrice: lastSalePriceKnown ? lastSalePrice : '',
            salePrice: soldItems[i]._auction.currentBid,
            name: soldItems[i]._staticData.name,
          });
        }
      }
      await new Store().removeSoldAuctions();

      Database.setJson('items-sold', savedSoldItems);
    }

    setTimeout(() => {
      if (this._running) {
        Queue.getInstance().add('Remove sold auctions', async () => {
          await this._handleExpiredAuctions(await new Store().getTradePile());
        });
      }
    }, this.getSettings().interval * 1000);
  }

  _sendToIFTTT(salePrice, profit, data) {
    const iftttMakerKey = this.getSettings()['ifttt-key'];
    if (iftttMakerKey === null) {
      return; // only send to IFTTT if the maker key is set in the settings
    }
    const url = `https://maker.ifttt.com/trigger/market_action/with/key/${iftttMakerKey}`;
    GM_xmlhttpRequest({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      url,
      data: JSON.stringify({ value1: salePrice, value2: profit, value3: data }),
    });
  }

  static _mutationHandler(mutationRecords) {
    mutationRecords.forEach((mutation) => {
      if ($(mutation.target).hasClass('DetailView') && $(mutation.target)
        .find('.DetailPanel') && mutation.addedNodes.length > 0) {
        if ($(mutation.target).find('#downloadSoldItems').length === 0) {
          if (gNavManager.getCurrentScreen()._screenId !== 'TradePile') {
            return;
          }

          const savedSoldItems = Database.getJson('items-sold', []);
          $(mutation.target).find('.DetailPanel ul').prepend(`<button id="downloadSoldItems" class="list"><span class="btn-text">Download sold items (${savedSoldItems.length})</span><span class="btn-subtext"></span></button>`);

          $('#downloadSoldItems').bind('click', async () => {
            const csv = RemoveSoldAuctions._convertToCsv(savedSoldItems);
            if (csv !== null) {
              browser.downloadFile('sold-items.csv', csv);
            } else {
              window.alert('No sold items to download'); // eslint-disable-line no-alert
            }
            Database.setJson('items-sold', []);
          });
        }
      }
    });
  }

  static _convertToCsv(jsonList) {
    if (jsonList === null || jsonList.length === 0) {
      return null;
    }

    const headers = Object.keys(jsonList[0]);

    let lines = '';
    jsonList.forEach((line) => {
      headers.forEach((key) => {
        lines += `${line[key]},`;
      });
      lines += '\r\n';
    });
    return `${headers.join(',')}\r\n${lines}`;
  }
}

/* eslint-disable no-new */
new RemoveSoldAuctions();
/* eslint-enable no-new */
