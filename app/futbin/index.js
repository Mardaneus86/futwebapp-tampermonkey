/* globals
GM_xmlhttpRequest
gNavManager
$
*/
import { BaseScript, SettingsEntry, Database } from '../core';
import { utils } from '../../fut';

import './style/futbin-prices.scss';

export class FutbinSettings extends SettingsEntry {
  static id = 'futbin';
  constructor() {
    super('futbin', 'FutBIN integration');
  }
}

class Futbin extends BaseScript {
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
    const showFutbinPricePages = ['WatchList', 'MyClubSearchFilters', 'UnassignedItems', 'TradePile', 'MyClubSearch', 'SearchResults'];

    if (showFutbinPricePages.indexOf(screen) !== -1) {
      if (this._intervalRunning) {
        clearInterval(this._intervalRunning);
      }
      this._intervalRunning = setInterval(function () {
        if (showFutbinPricePages.indexOf(gNavManager._currentScreen._screenId) === -1) {
          if (this._intervalRunning) {
            clearInterval(this._intervalRunning);
          }
          return;
        }
        const controller = gNavManager.getCurrentScreenController()._controller;

        const uiItems = gNavManager.getCurrentScreen().$_root.find('.listFUTItem');

        const targetForButton = uiItems.find('.auction');
        if (targetForButton !== null) {
          targetForButton.show(); // make sure it's always shown (#69)
        }

        if ($(uiItems[0]).find('.futbin').length > 0) {
          return;
        }

        let listController = null;
        if (screen === 'UnassignedItems' || screen === 'WatchList') {
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

        const resourceIdMapping = [];
        listrows.forEach((row, index) => {
          resourceIdMapping.push({
            target: uiItems[index],
            playerId: row.data.resourceId,
            item: row.data,
          });
        });

        const futbinUrl = `https://www.futbin.com/18/playerPrices?player=&all_versions=${
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
              Futbin._showFutbinPrice(item, futbinData);
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

  static async _showFutbinPrice(item, futbinData) {
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

    let futbinText = 'Futbin BIN';
    const playerUrl = await Futbin._getFutbinPlayerUrl(item.item);
    if (playerUrl) {
      futbinText = `<a target="_blank" href="${playerUrl}">Futbin BIN</a>`;
    }
    switch (gNavManager.getCurrentScreen()._screenId) {
      case 'UnassignedItems':
      case 'TradePile':
      case 'MyClubSearch':
      case 'WatchList':
        $('.secondary.player-stats-data-component').css('float', 'left');
        targetForButton = target.find('.auction');
        targetForButton.show();
        targetForButton.prepend(`<div class="auctionValue futbin"><span class="label">${futbinText}<span class="futbinupdate">(${futbinData[playerId].prices[platform].updated})</span></span><span class="coins value">${futbinData[playerId].prices[platform].LCPrice}</span></div>`);
        break;
      case 'SearchResults':
        targetForButton = target.find('.auctionValue').parent();
        targetForButton.prepend(`<div class="auctionValue futbin"><span class="label">${futbinText}<span class="futbinupdate">(${futbinData[playerId].prices[platform].updated})</span></span><span class="coins value">${futbinData[playerId].prices[platform].LCPrice}</span></div>`);
        break;
      default:
        // no need to do anything
    }
  }

  static _getFutbinPlayerUrl(item) {
    return new Promise((resolve) => {
      if (!item._staticData) {
        return resolve(null);
      }

      let futbinPlayerIds = Database.getJson('futbin-player-ids', []);
      const futbinPlayer = futbinPlayerIds.find(i => i.id === item.resourceId);
      if (futbinPlayer != null) {
        return resolve(`https://www.futbin.com/18/player/${futbinPlayer.futbinId}`);
      }

      const name = `${item._staticData.firstName} ${item._staticData.lastName}`.replace(' ', '+');
      const url = `https://www.futbin.com/search?year=18&term=${name}`;
      return GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: (res) => {
          if (res.status !== 200) {
            return resolve(null);
          }
          const players = JSON.parse(res.response);
          let exactPlayers = players.filter(p =>
            parseInt(p.rating, 10) === parseInt(item.rating, 10));
          if (exactPlayers.length > 1) {
            let version = Object.keys(enums.ItemRareType)[item.rareflag];
            if (item.rareflag < 3) {
              version = 'normal';
            }
            exactPlayers = exactPlayers.filter(p => p.version.toLowerCase() === version.toLowerCase());
          }
          if (exactPlayers.length === 1) {
            futbinPlayerIds = Database.getJson('futbin-player-ids', []);
            if (futbinPlayerIds.find(i => i.id === item.resourceId) == null) {
              futbinPlayerIds.push({
                id: item.resourceId,
                futbinId: exactPlayers[0].id,
              });
            }
            Database.setJson('futbin-player-ids', futbinPlayerIds);
            return resolve(`https://www.futbin.com/18/player/${exactPlayers[0].id}`);
          }

          return resolve(null); // TODO: what should we do if we find more than one?
        },
      });
    });
  }
}

new Futbin(); // eslint-disable-line no-new
