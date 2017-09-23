// ==UserScript==
// @name        FUT Increase Transfer Search List Size
// @version     0.1
// @description Increase Search Items Per Page to 30 instead of 15
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/transfer-search-increase-list-size.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/transfer-search-increase-list-size.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
(function() {
  'use strict';

  gAuthenticationModel.addListener(models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL, this, function() {
      gConfigurationModel.getConfigObject(models.ConfigurationModel.KEY_ITEMS_PER_PAGE)[models.ConfigurationModel.ITEMS_PER_PAGE.TRANSFER_MARKET] = 30;
  });
})();
