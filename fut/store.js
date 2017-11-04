/* global communication repositories enums services */

import { ListItemError } from './errors';
import priceTiers from './priceTiers';

export class Store {
  getUnassignedItems() {
    return new Promise((resolve) => {
      repositories.Item.reset(enums.FUTItemPile.PURCHASED);
      repositories.Item.getUnassignedItems().observe(this, function (o, list) {
        o.unobserve(this);
        resolve(list.items);
      });
    });
  }

  getTradePile() {
    return new Promise((resolve, reject) => {
      repositories.Item.getTransferItems().observe(this, (obs, data) => {
        obs.unobserve(this);

        if (data.error) {
          reject(new Error(data.erorr));
        } else {
          resolve(data.items);
        }
      });
    });
  }

  async getTradePileUnsold() {
    const tradepile = await this.getTradePile();

    return tradepile.filter(d => d.state === enums.ItemState.FREE && d._auction.buyNowPrice > 0);
  }

  /**
   * List item on transfermarket
   *
   * @param {FUTItem} item
   * @param {number} start start price
   * @param {number} buyNow buy now price
   * @param {number} duration time to list in seconds (1, 3, 6, 12, 24 or 72 hours)
   */
  async listItem(item, start, buyNow, duration = 3600) {
    return new Promise(async (resolve, reject) => {
      const prices = priceTiers.determineListPrice(start, buyNow);

      await this.sendToTradePile(item);

      const listItem = new communication.ListItemDelegate({
        itemId: item.id,
        startingBid: prices.start,
        buyNowPrice: prices.buyNow,
        duration,
      });
      listItem.addListener(communication.BaseDelegate.SUCCESS, this, (sender) => {
        sender.clearListenersByScope(this);
        resolve({
          startingBid: prices.start,
          buyNowPrice: prices.buyNow,
        });
      });
      listItem.addListener(communication.BaseDelegate.FAIL, this, (sender, response) => {
        sender.clearListenersByScope(this);
        reject(new ListItemError(response));
      });
      listItem.send();
    });
  }

  /* eslint-disable */
  relistAllItems() {
    const whatIsThis = services.Item.relistExpiredAuctions();
    debugger;
  }
  /* eslint-enable */

  sendToTradePile(item) {
    return new Promise((resolve, reject) => {
      const moveItem = new communication.MoveItemDelegate([item], enums.FUTItemPile.TRANSFER);
      moveItem.addListener(communication.BaseDelegate.SUCCESS, this, (sender) => {
        sender.clearListenersByScope(this);
        resolve();
      });
      moveItem.addListener(communication.BaseDelegate.FAIL, this, (sender, response) => {
        sender.clearListenersByScope(this);
        reject(new Error(response));
      });
      moveItem.send();
    });
  }

  redeemItem(item) {
    return new Promise((resolve, reject) => {
      const redeem = new communication.ConsumeUnlockableDelegate(item.id);
      redeem.addListener(communication.BaseDelegate.SUCCESS, this, (sender, response) => {
        sender.clearListenersByScope(this);
        resolve(response);
      });
      redeem.addListener(communication.BaseDelegate.FAIL, this, (sender, response) => {
        sender.clearListenersByScope(this);
        reject(response);
      });
      redeem.send();
    });
  }

  quickSell(items) {
    return new Promise((resolve) => {
      services.Item.discard(items).observe(this, (obs, res) => {
        obs.unobserve(this);
        resolve(res);
      });
    });
  }

  sendToClub(items) {
    return new Promise((resolve, reject) => {
      const moveItem = new communication.MoveItemDelegate(items, enums.FUTItemPile.CLUB);
      moveItem.addListener(communication.BaseDelegate.SUCCESS, this, (sender, response) => {
        sender.clearListenersByScope(this);
        resolve(response);
      });
      moveItem.addListener(communication.BaseDelegate.FAIL, this, (sender, response) => {
        sender.clearListenersByScope(this);
        reject(response);
      });
      moveItem.send();
    });
  }

  removeSoldAuctions() {
    return new Promise((resolve, reject) => {
      services.Item.clearSoldItems().observe(this, (observer, data) => {
        observer.unobserve(this);

        if (data.error) {
          reject(new Error(data.erorr));
        } else {
          resolve(data.items);
        }
      });
    });
  }
}
