// ==UserScript==
// @name        FUT Show Futbin player price in Search Results
// @version     0.1
// @description Show the Futbin prices for players in the Search Results
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @grant       GM_xmlhttpRequest
// @connect     *
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/show-futbin-player-price.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/show-futbin-player-price.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
(function() {
  'use strict';

  $(document).bind('DOMNodeInserted', function(event) {
    if ($(event.target).hasClass("listFUTItem")) {
      // Get the player ID from the attached player image
      var playerImageUrl = $(event.target).find('.photo').attr('src');
      var playerId = playerImageUrl.substr(playerImageUrl.lastIndexOf('/') + 1).replace('.png', '');

      var futbinUrl = "https://www.futbin.com/18/playerPrices?player=" + playerId;

      var ret = GM_xmlhttpRequest({
        method: "GET",
        url: futbinUrl,
        onload: function(res) {
            console.log(res);
            var data = JSON.parse(res.response);
            console.log(futbinUrl, data[playerId].prices.ps);

            var target = $(event.target).find('.auctionValue').parent();
            target.prepend('<div class="auctionValue"><span class="label">Futbin BIN</span><span class="coins value">' + data[playerId].prices.ps.LCPrice + '</span></div>');
        }
      });
    }
  });
})();