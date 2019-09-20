/* globals
window $ document */

import { BaseScript, SettingsEntry } from '../core';

import './style/transfer-totals.scss';

export class TransferTotalsSettings extends SettingsEntry {
  static id = 'transfer-totals';
  constructor() {
    super('transfer-totals', 'Transfer list totals', null);

    this.addSetting('Show transfer list totals', 'show-transfer-totals', true, 'checkbox');
  }
}

class TransferTotals extends BaseScript {
  constructor() {
    super(TransferTotalsSettings.id);

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this._observer = new MutationObserver(this._mutationHandler.bind(this));
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
  }

  deactivate(state) {
    super.deactivate(state);
    this._observer.disconnect();
  }

  _mutationHandler(mutationRecords) {
    const settings = this.getSettings();
    mutationRecords.forEach((mutation) => {
      if (
        $(mutation.target).find('.listFUTItem').length > 0 ||
        $(mutation.target).find('.futbin').length > 0
      ) {
        const controller = getAppMain()
          .getRootViewController()
          .getPresentedViewController()
          .getCurrentViewController()
          .getCurrentController();
        if (!controller || !controller._listController) {
          return;
        }

        if (window.currentPage !== 'UTTransferListSplitViewController') {
          return;
        }

        if (!settings.isActive || settings['show-transfer-totals'].toString() !== 'true') {
          return;
        }

        const lists = $('.ut-transfer-list-view .itemList');
        const items = controller._listController._viewmodel._collection;
        const listRows = $('.ut-transfer-list-view .listFUTItem');

        lists.each((index, list) => {
          const totals = {
            futbin: 0,
            bid: 0,
            bin: 0,
          };
          const listEl = $(list);

          if (!listEl.find('.listFUTItem').length) {
            return;
          }

          const firstIndex = $(list).find('.listFUTItem:first').index('.ut-transfer-list-view .listFUTItem');
          const lastIndex = $(list).find('.listFUTItem:last').index('.ut-transfer-list-view .listFUTItem');

          totals.futbin = items.slice(firstIndex, lastIndex + 1).reduce((sum, item, i) => {
            const futbin = parseInt(
              listRows.eq(i + firstIndex)
                .find('.auctionValue.futbin .coins.value')
                .text()
                .replace(/[,.]/g, ''),
              10,
            ) || 0;
            return sum + futbin;
          }, 0);
          totals.bid = items.slice(firstIndex, lastIndex + 1)
            .reduce((sum, item) => {
              const { currentBid, startingBid } = item._auction;
              const actualBid = currentBid > 0 ? currentBid : startingBid;
              return sum + actualBid;
            }, 0);
          totals.bin = items.slice(firstIndex, lastIndex + 1)
            .reduce((sum, item) => sum + item._auction.buyNowPrice, 0);

          const totalsItem = listEl.prev('.transfer-totals');

          if (!totalsItem.length) {
            $(`<div class="transfer-totals">
            <div class="auction">
              <div class="auctionValue futbin">
                <span class="label">Futbin BIN</span>
                <span class="coins value total-futbin">0</span>
              </div>
              <div class="auctionStartPrice auctionValue">&nbsp;</div>
              <div class="auctionValue">
                <span class="label">Bid Total</span>
                <span class="coins value total-bid">0</span>
              </div>
              <div class="auctionValue">
                <span class="label">BIN Total</span>
                <span class="coins value total-bin">0</span>
              </div>
            </div>
          </div>`).insertBefore(listEl);
          }

          if (totals.futbin > 0) {
            totalsItem.find('.total-futbin').text(totals.futbin);
            totalsItem.find('.futbin').show();
          } else {
            totalsItem.find('.futbin').hide();
          }
          totalsItem.find('.total-bin').text(totals.bin);
          totalsItem.find('.total-bid').text(totals.bid);
        });
      }
    });
  }
}

new TransferTotals(); // eslint-disable-line no-new
