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
    this._squadObserver = null;
  }

  activate(state) {
    super.activate(state);

    this._show(state.screenId);
  }

  onScreenRequest(screenId) {
    super.onScreenRequest(screenId);

    const controllerName = getAppMain().getRootViewController()
      .getPresentedViewController().getCurrentViewController()
      .getCurrentController().className;

    if (screenId === 'SBCSquadSplitViewController' ||
      screenId === 'SquadSplitViewController') {
      if (this.getSettings()['show-sbc-squad'].toString() !== 'true') {
        return;
      }

      this._squadObserver = getAppMain().getRootViewController()
        .getPresentedViewController().getCurrentViewController()
        .getCurrentController()._leftController._squad.onDataUpdated
        .observe(this, () => {
          $('.squadSlotPedestal.futbin').remove(); // forces update
          this._show('SBCSquadSplitViewController', true);
        });
      $('.ut-squad-summary-info--right.ut-squad-summary-info').append(`
        <div class="futbin total">
          <span class="ut-squad-summary-label">Total BIN value</span>
          <div style="text-align: right">
            <span class="ut-squad-summary-value coins value">---</span>
          </div>
        </div>
      `);
    } else if (this._squadObserver !== null &&
        controllerName !== 'SBCSquadSplitViewController' &&
        controllerName !== 'SquadSplitViewController') {
      this._squadObserver.unobserve(this);
    }

    this._show(screenId);
  }

  deactivate(state) {
    super.deactivate(state);

    $('.futbin').remove();

    if (this._squadObserver !== null) {
      this._squadObserver.unobserve(this);
    }

    if (this._intervalRunning) {
      clearInterval(this._intervalRunning);
    }
  }

  _show(screen, force = false) {
    const showFutbinPricePages = [
      'UTTransferListSplitViewController', // transfer list
      'UTWatchListSplitViewController', // transfer targets
      'UTUnassignedItemsSplitViewController', // pack buy
      'ClubSearchResultsSplitViewController', // club
      'UTMarketSearchResultsSplitViewController', // market search
      'UTPlayerPicksViewController',
      'SBCSquadSplitViewController',
      'SquadSplitViewController',
    ];

    if (showFutbinPricePages.indexOf(screen) !== -1) {
      if (this._intervalRunning) {
        clearInterval(this._intervalRunning);
      }
      this._intervalRunning = setInterval(() => {
        if (showFutbinPricePages.indexOf(window.currentPage) === -1 && !force) {
          if (this._intervalRunning) {
            clearInterval(this._intervalRunning);
          }
          return;
        }
        const controller = getAppMain().getRootViewController()
          .getPresentedViewController().getCurrentViewController()
          .getCurrentController();

        let uiItems = null;
        if (screen === 'SBCSquadSplitViewController' ||
          screen === 'SquadSplitViewController') {
          uiItems = $(controller._view.__root).find('.squadSlot');

          if (this.getSettings()['show-sbc-squad'].toString() !== 'true') {
            return;
          }
        } else {
          uiItems = $(getAppMain().getRootViewController()
            .getPresentedViewController().getCurrentViewController()
            ._view.__root).find('.listFUTItem');

          const targetForButton = uiItems.find('.auction');
          if (targetForButton !== null) {
            targetForButton.show(); // make sure it's always shown (#69)
          }
        }

        if ($(uiItems[0]).find('.futbin').length > 0) {
          return;
        }

        let listController = null;
        if (screen === 'SBCSquadSplitViewController' ||
          screen === 'SquadSplitViewController') {
          // not needed
        } else if (screen === 'UTPlayerPicksViewController') {
          if (!controller.getPresentedViewController()) {
            return;
          }
          if ($(controller.getPresentedViewController()._view.__root).find('.futbin').length > 0) {
            // Futbin prices already shown
            return;
          }
          listController = controller.getPresentedViewController();
        } else if (screen === 'UTUnassignedItemsSplitViewController' || screen === 'UTWatchListSplitViewController') {
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
        if (screen === 'SBCSquadSplitViewController' ||
          screen === 'SquadSplitViewController') {
          listrows = controller._squad._players.slice(0, 11).map(p => (
            {
              data: p._item,
            }));
        } else if (listController._picks && screen === 'UTPlayerPicksViewController') {
          listrows = listController._picks.map((pick, index) => (
            {
              data: pick,
              target: listController._view._playerPickViews[index].__root,
            }));
        } else if (listController._view._list &&
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

        const showBargains = (this.getSettings()['show-bargains'].toString() === 'true');

        const resourceIdMapping = [];
        listrows.forEach((row, index) => {
          resourceIdMapping.push({
            target: uiItems[index] || row.target,
            playerId: row.data.resourceId,
            item: row.data,
          });
        });

        let fetchedPlayers = 0;
        const fetchAtOnce = 30;
        const futbinlist = [];
        while (fetchedPlayers < resourceIdMapping.length) {
          const futbinUrl = `https://www.futbin.com/19/playerPrices?player=&all_versions=${
            resourceIdMapping.slice(fetchedPlayers, fetchedPlayers + fetchAtOnce)
              .map(i => i.playerId)
              .filter((current, next) => current !== next && current !== 0)
              .join(',')
          }`;
          fetchedPlayers += fetchAtOnce;
          GM_xmlhttpRequest({
            method: 'GET',
            url: futbinUrl,
            onload: (res) => {
              const futbinData = JSON.parse(res.response);
              resourceIdMapping.forEach((item) => {
                FutbinPrices._showFutbinPrice(screen, item, futbinData, showBargains);
                futbinlist.push(futbinData[item.playerId]);
              });
              const platform = utils.getPlatform();
              if (screen === 'SBCSquadSplitViewController' ||
                screen === 'SquadSplitViewController') {
                const futbinTotal = futbinlist.reduce(
                  (sum, item) =>
                    sum + parseInt(
                      item.prices[platform].LCPrice.toString().replace(/[,.]/g, ''),
                      10,
                    ) || 0
                  , 0,
                );
                $('.ut-squad-summary-value.coins.value').html(`${futbinTotal.toLocaleString()}`);
              }
            },
          });
        }
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

  static async _showFutbinPrice(screen, item, futbinData, showBargain) {
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

    if (target.find('.futbin').length > 0) {
      return; // futbin price already added to the row
    }

    const futbinText = 'Futbin BIN';

    switch (screen) {
      case 'SBCSquadSplitViewController':
      case 'SquadSplitViewController':
        target.prepend(`
        <div class="squadSlotPedestal no-state futbin">
          <span class="coins value" title="Last update: ${futbinData[playerId].prices[platform].updated || 'never'}">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
        </div>`);
        break;
      case 'UTPlayerPicksViewController':
        target.append(`
        <div class="auctionValue futbin">
          <span class="label">${futbinText}</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated || 'never'}</span>
        </div>`);
        break;
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
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated || 'never'}</span>
        </div>`);
        break;
      case 'SearchResults':
        targetForButton = target.find('.auctionValue').parent();
        targetForButton.prepend(`
        <div class="auctionValue futbin">
          <span class="label">${futbinText}</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated || 'never'}</span>
        </div>`);
        break;
      default:
        // no need to do anything
    }

    if (showBargain) {
      if (item.item._auction &&
        item.item._auction.buyNowPrice < futbinData[playerId].prices[platform].LCPrice.toString().replace(/[,.]/g, '')) {
        target.addClass('futbin-bargain');
      }
    }
  }
}
