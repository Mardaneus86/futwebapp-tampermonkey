/* globals
$
window
*/

import { utils } from '../../fut';
import { BaseScript } from '../core';
import { FutbinSettings } from './settings-entry';

export class FutbinPrices extends BaseScript {
  constructor() {
    super(FutbinSettings.id);
  }

  activate(state) {
    super.activate(state);

    this._show(state.screenId);
  }

  onScreenRequest(screenId) {
    super.onScreenRequest(screenId);
    this._show(screenId);
  }

  deactivate(state) {
    super.deactivate(state);

    $('.futbin').remove();

    if (this._intervalRunning) {
      clearInterval(this._intervalRunning);
    }
  }

  _show(screen) {
    const showFutbinPricePages = [
      'UTTransferListSplitViewController', // transfer list
      'UTWatchListSplitViewController', // transfer targets
      'UTUnassignedItemsSplitViewController', // pack buy
      'ClubSearchResultsSplitViewController', // club
      'UTMarketSearchResultsSplitViewController', // market search
    ];

    if (showFutbinPricePages.indexOf(screen) !== -1) {
      if (this._intervalRunning) {
        clearInterval(this._intervalRunning);
      }
      this._intervalRunning = setInterval(() => {
        if (showFutbinPricePages.indexOf(window.currentPage) === -1) {
          if (this._intervalRunning) {
            clearInterval(this._intervalRunning);
          }
          return;
        }
        const controller = getAppMain().getRootViewController()
          .getPresentedViewController().getCurrentViewController()
          .getCurrentController();

        const uiItems = $(getAppMain().getRootViewController()
          .getPresentedViewController().getCurrentViewController()
          ._view.__root).find('.listFUTItem');

        const targetForButton = uiItems.find('.auction');
        if (targetForButton !== null) {
          targetForButton.show(); // make sure it's always shown (#69)
        }

        if ($(uiItems[0]).find('.futbin').length > 0) {
          return;
        }

        let listController = null;
        if (screen === 'UTUnassignedItemsSplitViewController' || screen === 'UTWatchListSplitViewController') {
          if (!controller ||
            !controller._leftController ||
            !controller._leftController._view) {
            return;
          }
          listController = controller._leftController;
        } else {
          if (!controller ||
            !controller._listController ||
            !controller._listController._view) {
            return; // only run if data is available
          }
          listController = controller._listController;
        }

        let listrows = null;
        if (listController._view._list &&
          listController._view._list._listRows &&
          listController._view._list._listRows.length > 0) {
          listrows = listController._view._list._listRows; // for transfer market and club search
        } else if (listController._view._sections &&
          listController._view._sections.length > 0) { // for transfer list & trade pile
          listController._view._sections.forEach((row) => {
            if (row._listRows.length > 0) {
              if (listrows == null) {
                listrows = row._listRows;
              } else {
                listrows = listrows.concat(row._listRows);
              }
            }
          });
        }

        if (listrows === null) {
          return;
        }

        const showBargains = (this.getSettings()['show-bargains'] === 'true');

        const resourceIdMapping = [];
        listrows.forEach((row, index) => {
          resourceIdMapping.push({
            target: uiItems[index],
            playerId: row.data.resourceId,
            item: row.data,
          });
        });

        const futbinUrl = `https://www.futbin.com/19/playerPrices?player=&all_versions=${
          resourceIdMapping
            .map(i => i.playerId)
            .filter((current, next) => current !== next)
            .join(',')
        }`;
        GM_xmlhttpRequest({
          method: 'GET',
          url: futbinUrl,
          onload: (res) => {
            const futbinData = JSON.parse(res.response);
            resourceIdMapping.forEach((item) => {
              FutbinPrices._showFutbinPrice(item, futbinData, showBargains);
            });
          },
        });
      }, 1000);
    } else {
      // no need to search prices on other pages
      // reset page
      if (this._intervalRunning) {
        clearInterval(this._intervalRunning);
      }
      this._intervalRunning = null;
    }
  }

  static async _showFutbinPrice(item, futbinData, showBargain) {
    if (!futbinData) {
      return;
    }
    const target = $(item.target);
    const { playerId } = item;

    if (target.find('.player').length === 0) {
      // not a player
      return;
    }

    const platform = utils.getPlatform();

    if (!futbinData[playerId]) {
      return; // futbin data might not be available for this player
    }

    let targetForButton = null;

    if (showBargain) {
      if (item.item._auction.buyNowPrice < futbinData[playerId].prices[platform].LCPrice) {
        target.addClass('futbin-bargain');
      }
    }

    if (target.find('.futbin').length > 0) {
      return; // futbin price already added to the row
    }

    const futbinText = 'Futbin BIN';
    switch (window.currentPage) {
      case 'UTTransferListSplitViewController':
      case 'UTWatchListSplitViewController':
      case 'UTUnassignedItemsSplitViewController':
      case 'ClubSearchResultsSplitViewController':
      case 'UTMarketSearchResultsSplitViewController':
        $('.secondary.player-stats-data-component').css('float', 'left');
        targetForButton = target.find('.auction');
        targetForButton.show();
        targetForButton.prepend(`
        <div class="auctionValue futbin">
          <span class="label">${futbinText}</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated}</span>
        </div>`);
        break;
      case 'SearchResults':
        targetForButton = target.find('.auctionValue').parent();
        targetForButton.prepend(`
        <div class="auctionValue futbin">
          <span class="label">${futbinText}</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated}</span>
        </div>`);
        break;
      default:
        // no need to do anything
    }
  }
}
