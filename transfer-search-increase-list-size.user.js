// ==UserScript==
// @name        FUT Increase Transfer Search List Size
// @version     0.1.2
// @description Increase Search Items Per Page to 30 instead of 15
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/transfer-search-increase-list-size.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/transfer-search-increase-list-size.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  gNavManager.onScreenRequest.observe(this, function (obs, event) {
    gConfigurationModel.getConfigObject(models.ConfigurationModel.KEY_ITEMS_PER_PAGE)[models.ConfigurationModel.ITEMS_PER_PAGE.TRANSFER_MARKET] = 30;
  });
})();
