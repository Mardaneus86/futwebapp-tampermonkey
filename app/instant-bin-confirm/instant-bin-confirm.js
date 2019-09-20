/* global
gPopupClickShield
enums
controllers
utils
*/

import { BaseScript } from '../core';
import { InstantBinConfirmSettings } from './settings-entry';

export class InstantBinConfirm extends BaseScript {
  unmodifiedConfirmation = utils.PopupManager.ShowConfirmation;

  constructor() {
    super(InstantBinConfirmSettings.id);
  }

  activate(state) {
    super.activate(state);
  }

  onScreenRequest(screenId) {
    super.onScreenRequest(screenId);
    const settings = this.getSettings();

    utils.PopupManager.ShowConfirmation = (dialog, amount, proceed, s) => {
      let cancel = s;
      if (!utils.JS.isFunction(s)) {
        cancel = function () { };
      }

      if (settings.isActive && dialog.title ===
        utils.PopupManager.Confirmations.CONFIRM_BUY_NOW.title) {
        proceed();
        return;
      }
      const n = new controllers.views.popups.Dialog(
        dialog.message, dialog.title,
        enums.UIDialogTypes.MESSAGE, amount, dialog.buttonLabels,
      );
      n.init();
      gPopupClickShield.setActivePopup(n);
      n.onExit.observe(this, (e, t) => {
        if (t !== enums.UIDialogOptions.CANCEL && t !== enums.UIDialogOptions.NO) {
          if (proceed) {
            proceed();
          } else if (cancel) {
            cancel();
          }
        }
      });
    };
  }

  deactivate(state) {
    super.deactivate(state);
    utils.PopupManager.ShowConfirmation = this.unmodifiedConfirmation;
  }
}
