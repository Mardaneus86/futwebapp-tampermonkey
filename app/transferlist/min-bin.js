/* globals
GM_notification
gNavManager
window $ document
*/
import { BaseScript, SettingsEntry } from '../core';
import { TransferMarket, priceTiers } from '../../fut';

export class MinBinSettings extends SettingsEntry {
  static id = 'min-bin';
  constructor() {
    super('min-bin', 'Search minimum BIN');

    this.addSetting('Amount of lowest BINs to determine minimum on', 'mean-count', '3');
    this.addSetting('Adjust list price automatically', 'adjust-list-price', true);
    this.addSettingUnder('adjust-list-price', 'Start price percentage (0 to 100%)', 'start-price-percentage', '90');
    this.addSettingUnder('adjust-list-price', 'Buy now price percentage (0 to 100%)', 'buy-now-price-percentage', '110');
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
        if ($(mutation.target).find('#searchMinBin').length === 0) {
          let selectedItem = this._getSelectedItem();

          const knownPlayerPrice = this._playerPrices
            .find(p => p.resourceId === selectedItem.resourceId);
          let price = '';
          if (knownPlayerPrice != null) {
            price = `(${knownPlayerPrice.minimumBin})`;

            this._updateListPrice(knownPlayerPrice.minimumBin);
          }
          $(mutation.target).find('.DetailPanel ul').prepend(`<button id="searchMinBin" data-resource-id="${selectedItem.resourceId}" class="list"><span class="btn-text">Search minimum BIN ${price}</span><span class="btn-subtext"></span></button>`);

          $('#searchMinBin').bind('click', async () => {
            let btn = $('#searchMinBin');
            btn.find('.btn-text').html('Searching minimum BIN...');
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

            btn = $('#searchMinBin');
            if (btn.data('resource-id') === selectedItem.resourceId) {
              btn.find('.btn-text').html(`Search minimum BIN (${minimumBin})`);

              this._updateListPrice(minimumBin);
            }

            GM_notification({
              text: `Minimum BIN found for ${selectedItem._staticData.name} is ${minimumBin}`,
              title: 'FUT 18 Web App',
              timeout: 5000,
              onclick: () => window.focus(),
            });
          });
        }
      }
    }, this);
  }

  _updateListPrice(minimumBin) {
    const settings = this.getSettings();
    if (settings['adjust-list-price'] &&
      gNavManager.getCurrentScreenController()._controller._rightController
        ._currentController._quickListPanel) {
      const quicklistpanel = gNavManager.getCurrentScreenController()._controller._rightController
        ._currentController._quickListPanel._view;
      const bidSpinner = quicklistpanel._bidNumericStepper;
      const buySpinner = quicklistpanel._buyNowNumericStepper;
      const listPrice = priceTiers.determineListPrice(
        minimumBin * (settings['start-price-percentage'] / 100),
        minimumBin * (settings['buy-now-price-percentage'] / 100),
      );
      bidSpinner.value = listPrice.start;
      buySpinner.value = listPrice.buyNow;
    }
  }

  static _getSelectedItem() {
    if (gNavManager.getCurrentScreenController()._controller._listController) {
      return gNavManager.getCurrentScreenController()._controller._listController
        .getIterator().current();
    }

    return gNavManager.getCurrentScreenController()._controller._rightController
      ._currentController._viewmodel.current()._item;
  }
}

new MinBin(); // eslint-disable-line no-new
