/* global communication repositories enums services */

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
