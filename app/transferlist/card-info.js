/* globals
window $ document */

import { BaseScript, SettingsEntry } from '../core';

import './style/card-info.scss';

export class CardInfoSettings extends SettingsEntry {
  static id = 'card-info';
  constructor() {
    super('card-info', 'Extra card information', null);

    this.addSetting('Show contracts', 'show-contracts', true, 'checkbox');
    this.addSetting('Show fitness', 'show-fitness', true, 'checkbox');
  }
}

class CardInfo extends BaseScript {
  constructor() {
    super(CardInfoSettings.id);

    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    this._observer = new MutationObserver(this._mutationHandler.bind(this));
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
    const settings = this.getSettings();
    mutationRecords.forEach((mutation) => {
      if ($(mutation.target).find('.listFUTItem').length > 0) {
        const controller = getAppMain().getRootViewController()
          .getPresentedViewController().getCurrentViewController()
          .getCurrentController();
        if (!controller || !controller._listController) {
          return;
        }

        let items = [];
        if (controller._listController._view._list) {
          items = controller._listController._view._list._listRows;
        } else {
          items = controller._listController._viewmodel._collection.map(item => (
            { data: item }
          ));
        }
        const rows = $('.listFUTItem');

        rows.each((index, row) => {
          if ($(row).find('.infoTab-extra').length > 0) {
            return; // already added
          }

          let info = '';
          if (settings['show-fitness'].toString() === 'true') {
            info += `<div class="fitness" style="position: absolute;left: 5px;bottom: -3px;">
              F:${items[index].data.fitness}
              </div>`;
          }

          if (settings['show-contracts'].toString() === 'true') {
            info += `<div class="contracts" style="position: absolute;right: 5px;bottom: -3px;">
              C:${items[index].data.contract}
              </div>`;
          }

          $(row).find('.small.player').prepend(`<div class="infoTab-extra">${info}</div>`);
        });
      }
    });
  }
}

new CardInfo(); // eslint-disable-line no-new
