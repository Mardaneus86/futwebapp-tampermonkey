// ==UserScript==
// @name        FUT Confirm Buy Now Dialog
// @version     0.1.3
// @description Automatically confirm the Buy Now dialog
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/confirm-buynow-dialog.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/confirm-buynow-dialog.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  var targetNodes         = $(document);
  var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
  var myObserver          = new MutationObserver (mutationHandler);
  var obsConfig           = { childList: true, characterData: true, attributes: false, subtree: true };

  targetNodes.each ( function () {
      myObserver.observe (this, obsConfig);
  } );

  function mutationHandler (mutationRecords) {
    mutationRecords.forEach ( function (mutation) {
      if ($(mutation.addedNodes).hasClass('Dialog')) {
        if (gPopupClickShield._activePopup._title === "popup.buyNowConfirmationTitle") {
          gPopupClickShield._activePopup._eOptionSelected(2);
        }
      }
    });
  }
})();
