// ==UserScript==
// @name        FUT Search BIN
// @version     0.1.1
// @description Automatically search lowest BIN price on the market
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/search-bin-price.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/search-bin-price.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_notification
// @grant       window.focus
// ==/UserScript==

(function () {
  'use strict';

  $(document).bind('DOMNodeInserted', function (event) {
    if ($(event.target).hasClass("DetailPanel")) {
      if ($(event.target).find('#searchMinBin').length === 0) {
        $(event.target).find('.bidOptions').append('<button class="standard" id="searchMinBin">Search min BIN</button>');
        $(event.target).find('.QuickListPanel').append('<button class="standard" id="searchMinBin">Search min BIN</button>');
        $('#searchMinBin').click(function () {
          var playerImageUrl = $('.listFUTItem.selected').find('.photo').attr('src');
          var playerId = playerImageUrl.substr(playerImageUrl.lastIndexOf('/') + 1).replace('.png', '');

          search(playerId, 9999999999).observe(this, handleSearch);
        });
      }
    }
  });

  var minimumBIN = 9999999999;
  var maskedDefId = 0;
  var handleSearch = function handleSearch(t, data) {
    if (data.items.length > 0) {
      var newMinimumBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
      if (newMinimumBIN < minimumBIN) {
        minimumBIN = newMinimumBIN;
        console.log("new BIN price found: " + minimumBIN);
        setTimeout(function () { search(maskedDefId, minimumBIN).observe(this, handleSearch); }, 2000);
      } else {
        var lowestBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
        var player = repositories.Item.getStaticDataByDefId(maskedDefId);
        GM_notification({
          text: "Minimum BIN found for " + player.name + " is " + lowestBIN,
          title: "FUT 18 Web App",
          timeout: 5000,
          onclick: function () { window.focus(); },
        });
      }
    } else {
      var lowestBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
      var player = repositories.Item.getStaticDataByDefId(maskedDefId);
      GM_notification({
        text: "Minimum BIN found for " + player.name + " is " + lowestBIN,
        title: "FUT 18 Web App",
        timeout: 5000,
        onclick: function () { window.focus(); },
      });
    }
  };

  var search = function search(playerId, maxBuy) {
    minimumBIN = maxBuy;
    maskedDefId = playerId;
    if (maxBuy === 9999999999) {
      maxBuy = 0;
    }

    var searchCriteria = new transferobjects.SearchCriteria;
    searchCriteria.type = enums.SearchType.PLAYER;
    searchCriteria.defId = [maskedDefId];
    searchCriteria.maxBuy = maxBuy;

    return repositories.TransferMarket.search(searchCriteria);
  };
})();
