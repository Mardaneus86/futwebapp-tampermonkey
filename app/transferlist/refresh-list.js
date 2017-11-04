/* globals gNavManager $ */

import { BaseScript, SettingsEntry } from '../core';

export class RefreshListSettings extends SettingsEntry {
  static id = 'refresh-transferlist';
  constructor() {
    super('refresh-transferlist', 'Refresh transferlist', null);
  }
}

class RefreshTransferList extends BaseScript {
  constructor() {
    super(RefreshListSettings.id);
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
    $('#header').find('.subTitle').find('.refreshList').remove();
  }

  /* eslint-disable class-methods-use-this */
  _show(event) {
    switch (event) {
      case 'TradePile':
      case 'SearchResults':
        setTimeout(() => {
          if ($('#header .subTitle').find('.refreshList').length === 0) {
            $('#header').find('.subTitle').append('<a class="btn-flat next refreshList" style="float: right">Refresh list</a>');
            $('.refreshList').click(() => {
              gNavManager.getCurrentScreenController()._controller._listController._requestItems();
            });
          }
        }, 1000);
        break;
      default:
        // no need to show anything on other screens
    }
  }
  /* eslint-enable class-methods-use-this */
}

new RefreshTransferList(); // eslint-disable-line no-new
