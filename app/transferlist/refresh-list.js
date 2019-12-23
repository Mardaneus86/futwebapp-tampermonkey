/* globals $ */

import { BaseScript, SettingsEntry } from '../core';

import './style/refresh-list.scss';

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
    $('#header').find('.subTitle').find('.refresh').remove();
  }

  /* eslint-disable class-methods-use-this */
  _show(event) {
    switch (event) {
      case 'UTMarketSearchResultsSplitViewController': // market search
        setTimeout(() => {
          if ($('.pagingContainer').find('.refresh').length === 0) {
            $('.pagingContainer').append('<button class="flat pagination refresh" style="float: right;">Refresh list</button>');
            $('.refresh').click(() => {
              getAppMain().getRootViewController().getPresentedViewController()
                .getCurrentViewController()
                .getCurrentController()
                ._listController._requestItems();
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
