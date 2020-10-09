/* eslint-disable no-alert */
/* globals $ prompt */

import { BaseScript } from '../core';
import { SBCSettings } from './settings-entry';
import { Club, SBC, utils } from '../../fut';

export class SBCFutbin extends BaseScript {
  constructor() {
    super(SBCSettings.id);
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
  }

  /* eslint-disable class-methods-use-this */
  _show(event) {
    switch (event) {
      case 'UTSBCSquadSplitViewController': // SBC View
        setTimeout(async () => {
          // Add futbin SBC Link
          if ($('.challenge-content').find('.sbc-futbin-link').length === 0) {
            const challengeId = SBC.getSBCController()._challenge.id;
            const challengeName = SBC.getSBCController()._challenge.name;
            const futbinSBCLink = `<br/><br/><a href="https://www.futbin.com/squad-building-challenges/ALL/${challengeId}/${challengeName}" target="_blank" style="color: aliceblue;" class="sbc-futbin-link">> Futbin SBC Link</a>`;
            $('.challenge-details .description').append(futbinSBCLink);
          }

          // Add futbin SBC Button
          if ($('.challenge-content').find('.use-sbc-futbin').length === 0) {
            const futbinSBCButton = '<button class="btn-standard use-sbc-futbin">Use Futbin SBC</button>';
            $('.challenge-content').append(futbinSBCButton);
            $('.use-sbc-futbin').click(() => {
              SBCFutbin._setSBCPlayers();
            });
          }
        }, 300);
        break;
      default:
        // no need to show anything on other screens
    }
  }
  /* eslint-enable class-methods-use-this */

  static async _setSBCPlayers() {
    const SBCController = SBC.getSBCController();
    const squad = SBCController._squad;

    const club = new Club();
    const urlFutBin = prompt('Insert the Futbin SBC url', '');

    if (urlFutBin) {
      utils.updateTitle('Loading squad ... please wait.');
      const players = await SBCFutbin._getFutBinPlayerIds(urlFutBin);
      const itemPlayers = [];

      /* eslint-disable no-await-in-loop */
      /* eslint-disable no-restricted-syntax */
      for (const player of players) {
        const item = await club.getPlayer(player, true);
        itemPlayers.push(item[0]);
        await utils.sleep(100);
      }
      /* eslint-enable no-await-in-loop */
      /* eslint-enable no-restricted-syntax */
      squad.setPlayers(itemPlayers, true);
      utils.restoreTitle();
    }
  }

  static _getFutBinPlayerIds(url) {
    return new Promise((resolve) => {
      GM_xmlhttpRequest({
        method: 'GET',
        url,
        onload: (res) => {
          if (res.status !== 200) {
            return resolve(null);
          }

          const html = $(res.response);

          const $cards = $(html).find('.cardetails');

          let players = [];
          $cards.each((index, card) => {
            if ($(card).hasClass('hide') === false) {
              const cardDisplay = $(card).find('a > div');
              const resourceId = parseInt($(cardDisplay).attr('data-resource-id'), 10);
              if (resourceId) {
                players.push(resourceId);
              }
            }
          });
          players = players.reverse();

          return resolve(players);
        },
      });
    });
  }
}

new SBCFutbin(); // eslint-disable-line no-new
