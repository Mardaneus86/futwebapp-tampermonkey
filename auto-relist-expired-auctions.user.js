// ==UserScript==
// @name        FUT Auto Relist Unsold Transfers
// @version     0.1
// @description Automatically relist unsold items in the transfer list
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/auto-relist-unsold-transfers.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/auto-relist-unsold-transfers.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_notification
// @grant       window.focus
// ==/UserScript==
(function () {
  'use strict';

  gAuthenticationModel.addListener(models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL, this, function () {
    repositories.Item.getTransferItems().observe(this, _handleExpiredAuctions);

    setInterval(function () { repositories.Item.getTransferItems().observe(this, _handleExpiredAuctions); }, 60000);

    var _handleExpiredAuctions = function handleExpiredAuctions(observer, data) {
      if (data.items.filter(function (d) { return d.state === enums.ItemState.FREE && d._auction.buyNowPrice > 0; }).length > 0) {
        services.Item.relistExpiredAuctions();

        GM_notification({
          text: "Relisted expired auctions",
          title: "FUT 18 Web App",
          timeout: 5000,
          onclick: function () { window.focus(); },
        });
        console.log("Automatically Relisted Expired Auctions");
      }
    };
  });
})();
