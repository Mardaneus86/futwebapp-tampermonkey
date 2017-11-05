/* globals
enums transferobjects factories communication gUserModel models repositories
*/
import { mean } from 'math-statistics';

import utils from './utils';
import priceTiers from './priceTiers';
import { Logger } from './logger';
import { PinEvent } from './pinEvent';

export class TransferMarket {
  _logger = new Logger();

  /* eslint-disable class-methods-use-this */
  async navigateToTransferHub() {
    await PinEvent.sendPageView('Hub - Transfers');
  }
  /* eslint-enable class-methods-use-this */

  async searchMinBuy(item, itemsForMean = 3, lowUp = false) {
    this._logger.log(`Searching min buy for ${item.type} ${item._staticData.name} from low upward first ${lowUp}`, 'Core - Transfermarket');
    let minBuy = 0;

    if (lowUp) {
      minBuy = await this._findLowUp(item, itemsForMean);
      this._logger.log(`Low up search yielded ${minBuy} as a result`, 'Core - Transfermarket');
    }

    if (minBuy === 0) {
      this._logger.log('Searching low down...', 'Core - Transfermarket');
      minBuy = await this._findLowDown(item, itemsForMean);
    }

    this._logger.log(`Min buy for ${item.type} ${item._staticData.name} is ${minBuy}`, 'Core - Transfermarket');
    return minBuy;
  }

  relistAllItems() {
    return new Promise((resolve, reject) => {
      if (gUserModel.getTradeAccess() !== models.UserModel.TRADE_ACCESS.WHITELIST) {
        reject(new Error('You are not authorized for trading'));
        return;
      }

      const relistExpired = new communication.AuctionRelistDelegate();

      relistExpired.addListener(communication.BaseDelegate.SUCCESS, this, (sender) => {
        sender.clearListenersByScope(this);
        repositories.Item.setDirty(enums.FUTItemPile.TRANSFER);
        resolve();
      });

      relistExpired.addListener(communication.BaseDelegate.FAIL, this, (sender, error) => {
        sender.clearListenersByScope(this);
        reject(new Error(error));
      });
      relistExpired.execute();
    });
  }

  async _findLowUp(item, itemsForMean) {
    const searchCriteria = this._defineSearchCriteria(item, 200);
    await PinEvent.sendPageView('Transfer Market Search');
    await utils.sleep(5000);
    await PinEvent.sendPageView('Transfer Market Results - List View', 0);
    const items = await this._find(searchCriteria);
    if (items.length > itemsForMean) {
      // we find more than X listed at this price, so it must be low value
      return 200;
    }

    return 0; // trigger searching low down
  }

  async _findLowDown(item, itemsForMean) {
    let minBuy = 99999999;
    const searchCriteria = this._defineSearchCriteria(item);

    let valuesFound = [];
    for (let minBuyFound = false; minBuyFound === false;) {
      /* eslint-disable no-await-in-loop */
      await PinEvent.sendPageView('Transfer Market Search');
      await PinEvent.sendPageView('Transfer Market Results - List View', 0);
      const items = await this._find(searchCriteria);
      /* eslint-enable no-await-in-loop */
      if (items.length > 0) {
        valuesFound = valuesFound.concat(items.map(i => i._auction.buyNowPrice));

        const minBuyOnPage = Math.min(...items.map(i => i._auction.buyNowPrice));
        if (minBuyOnPage < minBuy) {
          minBuy = minBuyOnPage;
          if (items.length < searchCriteria.count) {
            minBuyFound = true;
            break;
          }
          searchCriteria.maxBuy = priceTiers.roundDownToNearestPriceTiers(minBuy);
          if (searchCriteria.maxBuy < 200) {
            searchCriteria.maxBuy = 200;
          }
        } else if (items.length === searchCriteria.count) {
          if (searchCriteria.maxBuy === 0) {
            searchCriteria.maxBuy = minBuy;
          } else {
            searchCriteria.maxBuy = priceTiers.roundDownToNearestPriceTiers(searchCriteria.maxBuy);
          }
          if (searchCriteria.maxBuy < 200) {
            searchCriteria.maxBuy = 200;
            minBuy = 200;
            minBuyFound = true;
          }
        } else {
          minBuy = Math.min(...items.map(i => i._auction.buyNowPrice));
          minBuyFound = true;
        }
      } else {
        minBuyFound = true;
      }
    }

    valuesFound = valuesFound.sort((a, b) => a - b).slice(0, itemsForMean);

    return priceTiers.roundValueToNearestPriceTiers(mean(valuesFound));
  }

  /* eslint-disable class-methods-use-this */
  _defineSearchCriteria(item, maxBuy = -1) {
    // TODO: check if this can handle other items as well
    const searchCriteria = new transferobjects.SearchCriteria();

    searchCriteria.count = 30;
    searchCriteria.maskedDefId = item.getMaskedResourceId();
    searchCriteria.type = item.type;

    // if it is TOTW or other special, set it to TOTW. See enums.ItemRareType.
    // Can only search for "Specials", not more specific on Rare Type
    if (item.rareflag >= enums.ItemRareType.TOTW) {
      searchCriteria.level = factories.DataProvider.getItemLevelDP(true)
        .filter(d => d.id === enums.ItemRareType.TOTW)[0].value;
    }

    searchCriteria.category = enums.SearchCategory.ANY;
    searchCriteria.position = enums.SearchType.ANY;
    if (maxBuy !== -1) {
      searchCriteria.maxBuy = maxBuy;
    }

    return searchCriteria;
  }
  /* eslint-enable class-methods-use-this */

  _find(searchCriteria) {
    return new Promise((resolve, reject) => {
      const o = new communication.SearchAuctionDelegate(searchCriteria);
      o.useClickShield(false);
      o.addListener(communication.BaseDelegate.SUCCESS, this, (sender, response) => {
        sender.clearListenersByScope(this);
        const t = factories.Item.generateItemsFromAuctionData(
          response.auctionInfo || [],
          response.duplicateItemIdList || [],
        );
        resolve(t);
      });
      o.addListener(communication.BaseDelegate.FAIL, this, (sender, error) => {
        sender.clearListenersByScope(this);
        reject(error);
      });
      o.send();
    });
  }
}
