// ==UserScript==
// @name        FUT Auto Remove Sold Auctions
// @version     0.1.1
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
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  gAuthenticationModel.addListener(models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL, this, function () {
    setInterval(function () { repositories.Item.getTransferItems().observe(this, _handleExpiredAuctions); }, 60000);

    var _handleExpiredAuctions = function handleExpiredAuctions(observer, data) {
      var soldItems = data.items.filter(function (d) { return d.state === enums.ItemState.INVALID; });
      if (soldItems.length > 0) {
        for (var i = 0; i < soldItems.length; i++) {
          if (soldItems[i].type == "player") {
            var player = repositories.Item.getStaticDataByDefId(soldItems[i].resourceId);

            GM_notification({
              text: player.name + " sold for " + soldItems[i]._auction.currentBid,
              title: "FUT 18 Web App",
              onclick: function () { window.focus(); },
            });
          } else {
            // TODO: can we get the item name?
            GM_notification({
              text: soldItems[i].type + " item sold for " + soldItems[i]._auction.currentBid,
              title: "FUT 18 Web App",
              onclick: function () { window.focus(); },
            });
          }
        }
        console.log(soldItems.length + " item(s) sold");
        services.Item.clearSoldItems().observe(this, function (observer, data) {
          //noop
        });
      }
    };
  });
})();
