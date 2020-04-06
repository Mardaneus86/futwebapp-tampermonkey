/* globals
$
window
*/

import { utils } from '../../fut';
import priceTiers from '../../fut/priceTiers';
import { BaseScript, Database } from '../core';
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
      screenId === 'SquadSplitViewController' ||
      screenId === 'UTSquadSplitViewController' ||
      screenId === 'UTSquadsHubViewController' ||
      screenId === 'UTSBCSquadSplitViewController') {
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
      if ($('.ut-squad-summary-info--right.ut-squad-summary-info').find('.futbin').length === 0) {
        $('.ut-squad-summary-info--right.ut-squad-summary-info').append(`
        <div class="futbin total">
          <span class="ut-squad-summary-label">Total BIN value</span>
          <div style="text-align: right">
            <span class="ut-squad-summary-value coins value">---</span>
          </div>
        </div>
      `);
      }
    } else if (this._squadObserver !== null &&
      controllerName !== 'SBCSquadSplitViewController' &&
      controllerName !== 'SquadSplitViewController' &&
      controllerName !== 'UTSquadSplitViewController' &&
      controllerName !== 'UTSquadsHubViewController' &&
      controllerName !== 'UTSBCSquadSplitViewController') {
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
      'UTSquadSplitViewController',
      'UTSquadsHubViewController',
      'UTSBCSquadSplitViewController',
    ];

    if (showFutbinPricePages.indexOf(screen) !== -1) {
      if (this._intervalRunning) {
        clearInterval(this._intervalRunning);
      }
      this._intervalRunning = setInterval(() => {
        const lastFutbinFetchFail = Database.get('lastFutbinFetchFail', 0);
        if (lastFutbinFetchFail + (5 * 60000) > Date.now()) {
          console.log(`Futbin fetching has been paused for 5 minutes because of failed requests earlier (retrying after ${new Date(lastFutbinFetchFail + (5 * 60000)).toLocaleTimeString()}). Check on Github for known issues.`); // eslint-disable-line no-console
          if (this._intervalRunning) {
            clearInterval(this._intervalRunning);
          }
          return;
        }
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
          screen === 'SquadSplitViewController' ||
          screen === 'UTSquadSplitViewController' ||
          screen === 'UTSquadsHubViewController' ||
          screen === 'UTSBCSquadSplitViewController') {
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
          screen === 'SquadSplitViewController' ||
          screen === 'UTSquadSplitViewController' ||
          screen === 'UTSquadsHubViewController' ||
          screen === 'UTSBCSquadSplitViewController') {
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
          screen === 'SquadSplitViewController' ||
          screen === 'UTSquadSplitViewController' ||
          screen === 'UTSquadsHubViewController' ||
          screen === 'UTSBCSquadSplitViewController') {
          listrows = controller._squad._players.slice(0, 11).map((p, index) => (
            {
              data: p._item,
              target: controller._view._lView._slotViews[index].__root,
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
        while (resourceIdMapping.length > 0 && fetchedPlayers < resourceIdMapping.length && Database.get('lastFutbinFetchFail', 0) + (5 * 60000) < Date.now()) {
          const futbinUrl = `https://www.futbin.com/20/playerPrices?player=&rids=${
            resourceIdMapping.slice(fetchedPlayers, fetchedPlayers + fetchAtOnce)
              .map(i => i.playerId)
              .filter((current, next) => current !== next && current !== 0)
              .join(',')
          }`;
          fetchedPlayers += fetchAtOnce;
          /* eslint-disable no-loop-func */
          GM_xmlhttpRequest({
            method: 'GET',
            url: futbinUrl,
            onload: (res) => {
              if (res.status !== 200) {
                Database.set('lastFutbinFetchFail', Date.now());
                GM_notification(`Could not load Futbin prices (code ${res.status}), pausing fetches for 5 minutes. Disable Futbin integration if the problem persists.`, 'Futbin fetch failed');
                return;
              }

              const futbinData = JSON.parse(res.response);
              resourceIdMapping.forEach((item) => {
                FutbinPrices._showFutbinPrice(screen, item, futbinData, showBargains);
                futbinlist.push(futbinData[item.playerId]);
              });
              const platform = utils.getPlatform();
              if (screen === 'SBCSquadSplitViewController' ||
                screen === 'SquadSplitViewController' ||
                screen === 'UTSquadSplitViewController' ||
                screen === 'UTSquadsHubViewController' ||
                screen === 'UTSBCSquadSplitViewController') {
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

    // Get Sell For Price After Tax
    if (item.item._auction.currentBid > 0) {
      var selForPrice = item.item._auction.currentBid;
    } else {
      var selForPrice = item.item._auction.startingBid;
    }
    var taxFivePercent = (6 / 100) * selForPrice;// Add 5% + 1 (for a profit) EA Tax to bid price before comparing
    var salePrice = selForPrice + taxFivePercent;

    switch (screen) {
      case 'SBCSquadSplitViewController':
      case 'SquadSplitViewController':
      case 'UTSquadSplitViewController':
      case 'UTSquadsHubViewController':
      case 'UTSBCSquadSplitViewController':
        target.prepend(`
        <div class="ut-squad-slot-pedestal-view no-state futbin">
          <span class="coins value" title="Last update: ${futbinData[playerId].prices[platform].updated || 'never'}">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
        </div>`);
        break;
      case 'UTPlayerPicksViewController':
        target.append(`
        <div class="auctionValue futbin">
          <span class="label">Futbin BIN:</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated || 'never'}</span>
        </div>
        <div class="auctionValue futbin">
        <span class="label">MIN Start Price:</span>
          <span class="coins value minbid">${priceTiers.roundUpToNearestPriceTiers(salePrice) || '---'}</span>
        </div>
        `);
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
          <span class="label minbid">MIN Bid:</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated || 'never'}</span>
        </div>
        <div class="auctionValue futbin">
          <span class="label">MIN Start Price:</span>
          <span class="coins value minbid">${priceTiers.roundUpToNearestPriceTiers(salePrice) || '---'}</span>
        </div>
        `);
        break;
      case 'SearchResults':
        targetForButton = target.find('.auctionValue').parent();
        targetForButton.prepend(`
        <div class="auctionValue futbin">
          <span class="label">Futbin BIN:</span>
          <span class="coins value">${futbinData[playerId].prices[platform].LCPrice || '---'}</span>
          <span class="time" style="color: #acacc4;">${futbinData[playerId].prices[platform].updated || 'never'}</span>
        </div>
        <div class="auctionValue futbin">
        <span class="label">MIN Start Price:</span>
          <span class="coins value minbid">${priceTiers.roundUpToNearestPriceTiers(salePrice) || '---'}</span>
        </div>
        `);
        break;
      default:
      // no need to do anything
    }

    if (showBargain) {
      /**
       * Inside the item.item._auction Object:
       * Object { 
       *        onDataUpdated: {…}, 
       *        _bidState: "none",
       *        _tradeState: "expired",
       *        stale: false,
       *        _watched: true,
       *        buyNowPrice: 500,
       *        currentBid: 0,
       *        expires: -1,
       *        isUpdating: false,
       *        startingBid: 450, … }
       */
      
      // Show Bin Bargain Price
      var binPriceFivePercent = (5 / 100) * item.item._auction.buyNowPrice;// Add 5% EA Tax to bin price before comparing
      var binPrice = item.item._auction.buyNowPrice + binPriceFivePercent;
      var binPriceNearestPrice = priceTiers.roundUpToNearestPriceTiers(binPrice);

      if (item.item._auction &&
        binPriceNearestPrice < futbinData[playerId].prices[platform].LCPrice.toString().replace(/[,.]/g, '')) {
        target.addClass('futbin-bargain');
      } else {
        // Show Bid Bargain Price
        if (item.item._auction.currentBid > 0) {
          var binBargainPrice = item.item._auction.currentBid;
        } else {
          var binBargainPrice = item.item._auction.startingBid;
        }
        var bidPriceFivePercent = (5 / 100) * binBargainPrice;// Add 5% EA Tax to bid price before comparing
        var bidPrice = binBargainPrice + bidPriceFivePercent;
        var bidPriceNearestPrice = priceTiers.roundUpToNearestPriceTiers(bidPrice);
        // console.log("bid Price"+bidPrice+" - Bid Price after fix: "+bidPriceNearestPrice);
        if (item.item._auction &&
          bidPriceNearestPrice < futbinData[playerId].prices[platform].LCPrice.toString().replace(/[,.]/g, '')) {
          target.addClass('futbin-bid-bargain');
        }
      }
    }
  }
}
