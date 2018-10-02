/* global
$
document
window
gPopupClickShield
*/

import { BaseScript } from '../core';
import { InstantBinConfirmSettings } from './settings-entry';

export class InstantBinConfirm extends BaseScript {
  constructor() {
    super(InstantBinConfirmSettings.id);
  }

  activate(state) {
    function mutationHandler(mutationRecords) {
      mutationRecords.forEach((mutation) => {
        if ($(mutation.addedNodes).hasClass('Dialog')) {
          const t = gPopupClickShield._activePopup._title;
          if (t === 'popup.buyNowConfirmationTitle') {
            setTimeout(() => {
              gPopupClickShield._activePopup._eOptionSelected(2);
            }, 13);
          }
        }
      });
    }

    super.activate(state);
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const obsConfig = {
      childList: true,
      characterData: true,
      attributes: false,
      subtree: true,
    };
    this.observer = new MutationObserver(mutationHandler);
    this.observer.observe(document, obsConfig);
  }

  onScreenRequest(screenId) {
    super.onScreenRequest(screenId);
  }

  deactivate(state) {
    super.deactivate(state);
    this.observer.disconnect();
  }
}
