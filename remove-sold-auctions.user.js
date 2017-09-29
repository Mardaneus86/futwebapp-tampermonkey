// ==UserScript==
// @name        FUT Auto Remove Sold Auctions
// @version     0.1.3
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
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @connect     maker.ifttt.com
// @require     https://raw.githubusercontent.com/WebReflection/circular-json/v0.3.3/build/circular-json.js
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  var sendToIFTTT = function sendToIFTTT(salePrice, profit, data) {
    var ifttt_maker_key = localStorage.getItem('ifttt_maker_key');
    if (ifttt_maker_key === null) {
      return; // only send to IFTTT if the maker key is set in the settings
    }
    var url = "https://maker.ifttt.com/trigger/market_action/with/key/" + ifttt_maker_key;
    GM_xmlhttpRequest({
      method: "POST",
      headers: {"Content-Type": "application/json"},
      url: url,
      data: CircularJSON.stringify({ "value1" : salePrice, "value2" : profit, "value3" : CircularJSON.stringify(data) })
    });
  };

  gAuthenticationModel.addListener(models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL, this, function () {
    setInterval(function () { repositories.Item.getTransferItems().observe(this, _handleExpiredAuctions); }, 60000);

    var _handleExpiredAuctions = function handleExpiredAuctions(observer, data) {
      var unsoldItems = data.items.filter(function(d) { return d.state !== enums.ItemState.INVALID; });

      if (unsoldItems.length > 0) {
        var lastSalePrices = JSON.parse(GM_getValue('auctionlastprices', '{}'));

        for (var j = 0; j < unsoldItems.length; j++) {
          if (lastSalePrices[unsoldItems[j].id] === null) {
            lastSalePrices[unsoldItems[j].id] = {
              lastSalePrice: unsoldItems[j].lastSalePrice
            };
          }
        }
        GM_setValue('auctionlastprices', JSON.stringify(lastSalePrices));
      }

      var soldItems = data.items.filter(function (d) { return d.state === enums.ItemState.INVALID; });
      if (soldItems.length > 0) {
        for (var i = 0; i < soldItems.length; i++) {
          var lastSalePrice = 0;
          var lastSalePriceKnown = false;
          var lastSalePricesList = JSON.parse(GM_getValue('auctionlastprices', '{}'));
          var lastSalePriceO = lastSalePricesList[soldItems[i].id];
          if (!!lastSalePriceO) {
            lastSalePrice = lastSalePriceO.lastSalePrice;
            lastSalePriceKnown = true;
          }
          var profit = (soldItems[i]._auction.currentBid * 0.95) - lastSalePrice; // calculate 5% EA tax
          if (soldItems[i].type == "player") {
            var player = repositories.Item.getStaticDataByDefId(soldItems[i].resourceId);
            var playerName = "Unknown player";
            if (player !== null) {
              playerName = player.name + " (" + player.rating + ")";
            }
            GM_notification({
              text: playerName + " sold for " + soldItems[i]._auction.currentBid,
              title: "FUT 18 Web App",
              onclick: function () { window.focus(); },
            });

            sendToIFTTT(soldItems[i]._auction.currentBid, lastSalePriceKnown ? profit : "", {
              lastSalePrice: lastSalePriceKnown ? lastSalePrice : "",
              salePrice: soldItems[i]._auction.currentBid,
              name: playerName
            });
          } else {
            // TODO: can we get the item name?
            GM_notification({
              text: soldItems[i]._staticData.name + " item sold for " + soldItems[i]._auction.currentBid,
              title: "FUT 18 Web App",
              onclick: function () { window.focus(); },
            });
            sendToIFTTT(soldItems[i]._auction.currentBid, lastSalePriceKnown ? profit : "", {
              lastSalePrice: lastSalePriceKnown ? lastSalePrice : "",
              salePrice: soldItems[i]._auction.currentBid,
              name: soldItems[i]._staticData.name
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
