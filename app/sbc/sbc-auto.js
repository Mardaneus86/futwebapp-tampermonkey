/* globals $ UTSearchCriteriaDTO enums */
import { BaseScript } from '../core';
import { SBCSettings } from './settings-entry';
import { Club, Squad, SBC, utils } from '../../fut';

export class SBCAuto extends BaseScript {
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
          const SBCController = SBC.getSBCController();
          if (SBCController._challenge.assetId === 1001001) {
            if ($('.challenge-content').find('.sbc-auto').length === 0) {
              const SBCAutoButton = '<button class="btn-standard sbc-auto">Auto-fill</button>';
              $('.challenge-content').append(SBCAutoButton);
              $('.sbc-auto').click(() => {
                SBCAuto._generateGold();
              });
            }
          }
        }, 1000);
        break;
      default:
        // no need to show anything on other screens
    }
  }
  /* eslint-enable class-methods-use-this */

  static async _generateGold() {
    const SBCController = SBC.getSBCController();
    const squad = SBCController._squad;

    const club = new Club();
    const players = [];
    let excludeDefIds = [];

    // Exclude current squad players
    const currentSquad = await Squad.getCurrentSquadIds();
    excludeDefIds = currentSquad.data.defIds;

    // Search player in club for each position
    utils.updateTitle('Loading squad ... please wait.');
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const pos of squad._formation.positions) {
      const player = await SBCAuto._searchPlayerForSBC(club, pos, excludeDefIds);
      if (player) {
        excludeDefIds.push(player.resourceId);
      }
      await utils.sleep(100);
      players.push(player);
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */

    // Set players in the SBC
    squad.setPlayers(players, true);
    utils.restoreTitle();
  }

  /**
   * Search player for SBC Position
   */
  static async _searchPlayerForSBC(club, position, excludeDefIds) {
    const timeAfterSearch = 100;
    const positionsZones = {
      // Attack
      ST: ['CF'],
      CF: ['ST'],
      // Middle
      CAM: ['CF', 'CM', 'CDM', 'ST'],
      CM: ['CAM', 'CDM', 'CF', 'ST'],
      CDM: ['CM', 'CAM', 'CF', 'ST'],
      // Left
      LB: ['LWB', 'CB', 'RB', 'RWB', 'LM'],
      LWB: ['LB', 'CB', 'RB', 'RWB', 'LM'],
      LM: ['LW', 'LF', 'LB', 'LWB', 'RM'],
      LW: ['LM', 'LF'],
      LF: ['LW', 'LM'],
      // Right
      RB: ['RWB', 'CB', 'LB', 'LWB', 'RM'],
      RWB: ['RB', 'CB', 'LB', 'LWB', 'RM'],
      RM: ['RW', 'RF', 'RB', 'RWB', 'LM'],
      RW: ['RM', 'RF'],
      RF: ['RW', 'RM'],
      // Defense
      CB: ['RB', 'LB', 'CDM'],
      GK: [],
    };

    const positionTypeName = position.typeName;
    let playerFound = [];
    const searchCriteria = new UTSearchCriteriaDTO();
    searchCriteria.type = enums.SearchType.PLAYER;
    searchCriteria.level = enums.SearchLevel.GOLD;
    searchCriteria.sort = enums.SearchSortOrder.ASCENDING;
    searchCriteria.sortBy = enums.SearchSortType.RATING;
    searchCriteria.excludeDefIds = excludeDefIds;
    searchCriteria.count = 1;

    // 1 : Search untradeable + position
    searchCriteria.position = positionTypeName;
    searchCriteria.isUntradeable = enums.SearchUntradeables.ONLY;
    searchCriteria.untradeables = enums.SearchUntradeables.ONLY;
    playerFound = await club.search(searchCriteria);
    if (playerFound.length > 0) {
      return playerFound[0];
    }
    await utils.sleep(timeAfterSearch);

    // 2 : Search untradeable + position zone
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const pTypeName of positionsZones[positionTypeName]) {
      searchCriteria.position = pTypeName;
      searchCriteria.isUntradeable = enums.SearchUntradeables.ONLY;
      searchCriteria.untradeables = enums.SearchUntradeables.ONLY;
      playerFound = await club.search(searchCriteria);
      if (playerFound.length > 0) {
        break;
      }
      await utils.sleep(timeAfterSearch);
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */
    if (playerFound.length > 0) {
      return playerFound[0];
    }

    // 3 : Search all + position
    searchCriteria.zone = -1;
    searchCriteria.position = positionTypeName;
    searchCriteria.isUntradeable = enums.SearchUntradeables.DEFAULT;
    searchCriteria.untradeables = enums.SearchUntradeables.DEFAULT;
    playerFound = await club.search(searchCriteria);
    if (playerFound.length > 0) {
      return playerFound[0];
    }
    await utils.sleep(timeAfterSearch);

    // 4 : Search all + position zone
    /* eslint-disable no-await-in-loop */
    /* eslint-disable no-restricted-syntax */
    for (const pTypeName of positionsZones[positionTypeName]) {
      searchCriteria.position = pTypeName;
      searchCriteria.isUntradeable = enums.SearchUntradeables.DEFAULT;
      searchCriteria.untradeables = enums.SearchUntradeables.DEFAULT;
      playerFound = await club.search(searchCriteria);
      if (playerFound.length > 0) {
        break;
      }
      await utils.sleep(timeAfterSearch);
    }
    /* eslint-enable no-await-in-loop */
    /* eslint-enable no-restricted-syntax */
    if (playerFound.length > 0) {
      return playerFound[0];
    }

    // X : Not found
    return false;
  }
}

new SBCAuto(); // eslint-disable-line no-new
