/* globals
gLocalization
$
*/

import { Club, utils } from '../../fut';

import { BaseScript, SettingsEntry, browser } from '../core';

import './style/club-info.scss';

export class ClubInfoSettings extends SettingsEntry {
  static id = 'club-info';
  constructor() {
    super('club-info', 'Extract club information', null);
  }
}

class ClubInfo extends BaseScript {
  constructor() {
    super(ClubInfoSettings.id);

    this._club = new Club();
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
    $('#MyClubItemsSearchHeader').find('#club-info').remove();
  }

  _show(event) {
    switch (event) {
      case 'MyClubSearch':
        setTimeout(() => {
          if ($('.MyClubItemsSearchHeader').find('#download-club-info').length === 0) {
            $('.MyClubItemsSearchHeader').append(`<span id="download-club-info">
              <div role="button" class="btn btn-raised mini">
                <span class="btn-text">Download player list</span><span class="btn-subtext invisible"></span>
              </div>
            </span>`);
            $('#download-club-info').click(async () => {
              if (this._running) { return; }
              this._running = true;
              $('#download-club-info').find('.btn-text').html('Fetching all players...');
              const players = [];
              let result = await this._club.getPlayers(0, 90);
              players.push(...result.players);

              /* eslint-disable no-await-in-loop */
              while (!result.isLastPage) {
                await utils.sleep(5000);
                result = await result.getNextPage();
                players.push(...result.players);
              }
              /* eslint-enable no-await-in-loop */

              browser._downloadFile('players.csv', ClubInfo._convertJsonToCsv(players));
              $('#download-club-info').find('.btn-text').html('Download player list');
            });
          }
        }, 1000);
        break;
      default:
        // no need to show anything on other screens
    }
  }

  static _convertJsonToCsv(data) {
    const items = data;
    const replacer = (key, value) => (value === null ? '' : value); // specify how you want to handle null values here
    const staticDataHeader = [
      'firstName',
      'lastName',
      'name',
      'knownAs',
    ];
    const header = [
      'concept',
      'contract',
      'discardValue',
      'duplicateId',
      'duplicateItemLoans',
      'fitness',
      'iconId',
      'id',
      'injuryGames',
      'lastSalePrice',
      'leagueId',
      'loans',
      'loyaltyBonus',
      'nationId',
      'pile',
      'playStyle',
      'preferredPosition',
      'rareflag',
      'rating',
      'resourceGameYear',
      'resourceId',
      'stackCount',
      'state',
      'subtype',
      'suspensionGames',
      'teamId',
      'training',
      'type',
      'untradeable',
      'untradeableCount',
    ];
    const otherHeaders = [
      'team',
      'league',
      'nation',
    ];
    const staticData = row => staticDataHeader
      .map(shFieldName => JSON.stringify(row._staticData[shFieldName], replacer))
      .join(',');
    const fields = row => header
      .map(fieldName => JSON.stringify(row[fieldName], replacer))
      .join(',');
    const team = row => gLocalization.lText(`global.teamFull.2018.team${row.teamId}`);
    const nation = row => gLocalization.lText(`search.nationName.nation${row.nationId}`);
    const league = row => gLocalization.lText(`global.leagueabbr15.2018.league${row.leagueId}`);
    const csv = items.map(row => `${staticData(row)},${fields(row)},${team(row)},${league(row)},${nation(row)}`);
    csv.unshift(`${staticDataHeader.join(',')},${header.join(',')},${otherHeaders.join(',')}`);
    return csv.join('\r\n');
  }
}

new ClubInfo(); // eslint-disable-line no-new
