// ==UserScript==
// @name        FUT Auto Remove Sold Auctions
// @version     0.1
// @description Automatically remove sold items from the transfer list
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/remove-sold-auctions.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/remove-sold-auctions.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_notification
// @grant       window.focus
// ==/UserScript==
(function() {
  'use strict';

  gAuthenticationModel.addListener(models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL, this, function() {
    repositories.Item.getTransferItems().observe(this, _handleExpiredAuctions);

    setInterval(function() { repositories.Item.getTransferItems().observe(this, _handleExpiredAuctions); }, 60000);

    var _handleExpiredAuctions = function handleExpiredAuctions(observer, data) {
      var soldItems = data.items.filter(function(d) { return d.state === enums.ItemState.INVALID; });
      if (soldItems.length > 0) {
        for(var i = 0; i < soldItems.length; i++) {
            var player = repositories.Item.getStaticDataByDefId(maskedDefId);
            GM_notification({
                text: player.name + " sold for " + soldItems[i]._auction.currentBid,
                title: "FUT 18 Web App",
                onclick: function() { window.focus(); },
            });
        }
        console.log(soldItems.length + " item(s) sold");
        services.Item.clearSoldItems().observe(this, function(observer, data) {
          //noop
        });
      }
    };
  });
})();
