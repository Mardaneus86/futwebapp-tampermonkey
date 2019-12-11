/* globals
window $ document
*/
import { analytics, BaseScript, SettingsEntry } from '../core';
import { TransferMarket, priceTiers } from '../../fut';

export class MinBinSettings extends SettingsEntry {
  static id = 'min-bin';
  constructor() {
    super('min-bin', 'Search minimum BIN');

    this.addSetting('Amount of lowest BINs to determine minimum on', 'mean-count', 3, 'number');
    this.addSetting('Adjust quicklist panel price automatically based on minimum BIN', 'adjust-list-price', true, 'checkbox');
    this.addSettingUnder('adjust-list-price', 'Start price percentage (0 to 100%)', 'start-price-percentage', 90, 'number');
    this.addSettingUnder('adjust-list-price', 'Buy now price percentage (0 to 100%)', 'buy-now-price-percentage', 110, 'number');
  }
}

class MinBin extends BaseScript {
  constructor() {
    super(MinBinSettings.id);

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this._observer = new MutationObserver(this._mutationHandler.bind(this));

    this._playerPrices = [];
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
    mutationRecords.forEach(function (mutation) {
      if ($(mutation.target).hasClass('DetailView') && $(mutation.target)
        .find('.DetailPanel') && mutation.addedNodes.length > 0) {
        const searchMinBin = $(mutation.target).find('#searchMinBin');
        searchMinBin.remove();

        let selectedItem = this._getSelectedItem();

        if (selectedItem == null || selectedItem.resourceId === 0) {
          return;
        }
        const knownPlayerPrice = this._playerPrices
          .find(p => p.resourceId === selectedItem.resourceId);
        let price = '';
        if (knownPlayerPrice != null) {
          price = `(${knownPlayerPrice.minimumBin})`;

          this._updateListPrice(knownPlayerPrice.minimumBin);
        }
        $(mutation.target).find('.DetailPanel > .ut-button-group').prepend(`<button id="searchMinBin" data-resource-id="${selectedItem.resourceId}" class="list"><span class="btn-text">Search minimum BIN ${price}</span><span class="btn-subtext"></span></button>`);

        $('#searchMinBin').bind('click', async () => {
          const btn = $('#searchMinBin');
          btn.find('.btn-text').html('Searching minimum BIN...');
          analytics.trackEvent('Min BIN', 'Search Min BIN', btn.data('resource-id'));
          const settings = this.getSettings();
          const minimumBin = await new TransferMarket().searchMinBuy(selectedItem, parseInt(settings['mean-count'], 10));
          const playerPrice = this._playerPrices.find(p => p.resourceId === btn.data('resource-id'));
          if (playerPrice != null) {
            this._playerPrices.splice(this._playerPrices.indexOf(playerPrice), 1);
          }
          this._playerPrices.push({
            resourceId: btn.data('resource-id'),
            minimumBin,
          });

          selectedItem = this._getSelectedItem();

          let notificationText = `Minimum BIN found for ${selectedItem._staticData.name} (Flag no: ${selectedItem.rareflag}) is ${minimumBin}`;
          if (btn.data('resource-id') === selectedItem.resourceId) {
            if (minimumBin === 0) {
              btn.find('.btn-text').html('Search minimum BIN (extinct)');
              notificationText = `Minimum BIN not found for ${selectedItem._staticData.name} (Flag no: ${selectedItem.rareflag}), card may be extinct`;
            } else {
              btn.find('.btn-text').html(`Search minimum BIN (${minimumBin})`);

              this._updateListPrice(minimumBin);
            }
          }

          GM_notification({
            text: notificationText,
            title: 'FUT 20 Web App',
            timeout: 5000,
            onclick: () => window.focus(),
          });
        });
      }
    }, this);
  }

  _updateListPrice(minimumBin) {
    const settings = this.getSettings();
    const quicklistPanel = getAppMain().getRootViewController()
      .getPresentedViewController()
      .getCurrentViewController()
      .getCurrentController()
      ._rightController._currentController._quickListPanel;

    if (settings['adjust-list-price'] && quicklistPanel) {
      const quicklistpanelView = quicklistPanel._view;

      const listPrice = priceTiers.determineListPrice(
        minimumBin * (settings['start-price-percentage'] / 100),
        minimumBin * (settings['buy-now-price-percentage'] / 100),
      );

      if (quicklistPanel._item) {
        // sets the values when the quicklistpanel hasn't been initialized
        const auction = quicklistPanel._item._auction;
        if (auction.tradeState === 'closed') {
          // item is sold
          return;
        }
        if (auction.tradeState !== 'active') {
          auction.startingBid = listPrice.start;
          auction.buyNowPrice = listPrice.buyNow;
          quicklistPanel._item.setAuctionData(auction);
        }
      }

      const bidSpinner = quicklistpanelView._bidNumericStepper;
      const buySpinner = quicklistpanelView._buyNowNumericStepper;
      bidSpinner.setValue(listPrice.start);
      buySpinner.setValue(listPrice.buyNow);
    }
  }

  /* eslint-disable class-methods-use-this */
  _getSelectedItem() {
    const listController = getAppMain().getRootViewController()
      .getPresentedViewController()
      .getCurrentViewController()
      .getCurrentController()._listController;
    if (listController) {
      return listController.getIterator().current();
    }

    const detailController = getAppMain().getRootViewController()
      .getPresentedViewController()
      .getCurrentViewController()
      .getCurrentController()._rightController;
    if (detailController && detailController._currentController._viewmodel) {
      const current = detailController
        ._currentController._viewmodel.current();

      return current._item ? current._item : current;
    }

    return null;
  }
  /* eslint-enable class-methods-use-this */
}

new MinBin(); // eslint-disable-line no-new
