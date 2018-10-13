/* globals
window $ document */

import { BaseScript, SettingsEntry } from '../core';

import './style/transfer-totals.scss';

export class TransferTotalsSettings extends SettingsEntry {
  static id = 'transfer-totals';
  constructor() {
    super('transfer-totals', 'Transfer list totals', null);

    this.addSetting('Show transfer lost totals', 'show-transfer-totals', 'true');
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

        if (!settings.isActive || settings['show-transfer-totals'] !== 'true') {
          return;
        }

        const lists = $('.list-view .itemList');

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

          listEl.find('.listFUTItem').each((rowIndex, row) => {
            const rowEl = $(row);
            const hasFutbin = rowEl.find('.auctionValue.futbin').length > 0;
            const futbinValue = hasFutbin
              ? parseInt(
                rowEl
                  .find('.auctionValue.futbin .coins.value')
                  .text()
                  .replace(/[,.]/g, ''),
                10,
              )
              : 0;
            const bidValue = parseInt(
              rowEl
                .find(`.auctionValue:eq(${hasFutbin ? 2 : 1}) .coins.value`)
                .text()
                .replace(/[,.]/g, ''),
              10,
            );
            const binValue = parseInt(
              rowEl
                .find(`.auctionValue:eq(${hasFutbin ? 3 : 2}) .coins.value`)
                .text()
                .replace(/[,.]/g, ''),
              10,
            );
            totals.futbin += futbinValue;
            totals.bid += bidValue;
            totals.bin += binValue;
          });

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
