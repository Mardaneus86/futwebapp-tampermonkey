// ==UserScript==
// @name        FUT Show Futbin player price
// @version     0.1.6
// @description Show the Futbin prices for players in the Search Results and Club Search
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @grant       GM_xmlhttpRequest
// @connect     www.futbin.com
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/show-futbin-player-price.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/show-futbin-player-price.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  var showFutbinPrice = function showFutbinPrice(target) {
    if (target.find('.player').length === 0) {
      // not a player
      return;
    }

    var platform = '';
    if (repositories.User.getCurrent().getSelectedPersona().isPlaystation) platform = "ps";
    if (repositories.User.getCurrent().getSelectedPersona().isPC) platform = "pc";
    if (repositories.User.getCurrent().getSelectedPersona().isXbox) platform = "xbox";

    // Get the player ID from the attached player image
    var playerImageUrl = target.find('.photo').attr('src');
    var playerId = playerImageUrl.substr(playerImageUrl.lastIndexOf('/') + 1).replace('.png', '');
    if(playerId.startsWith('p')) {
      playerId = playerId.substr(1);
    }

    var futbinUrl = "https://www.futbin.com/18/playerPrices?player=" + playerId;

    GM_xmlhttpRequest({
      method: "GET",
      url: futbinUrl,
      onload: function (res) {
        var data = JSON.parse(res.response);
        
        if (target.find('.futbin').length > 0) {
          return; // futbin price already added to the row
        }
        
        var targetForButton = null;
        switch(gNavManager.getCurrentScreen()._screenId) {
          case "TradePile":
          case "MyClubSearch":
            $(".secondary.player-stats-data-component").css('float', 'left');
            targetForButton = target.find('.entityContainer');
            targetForButton.append('<div class="auction futbin" style="margin: 0; width: auto;"><span class="label">Futbin BIN</span><span class="coins value">' + data[playerId].prices[platform].LCPrice + '</span></div>');
            break;
          case "SearchResults":
            targetForButton = target.find('.auctionValue').parent();
            targetForButton.prepend('<div class="auctionValue futbin"><span class="label">Futbin BIN</span><span class="coins value">' + data[playerId].prices[platform].LCPrice + '</span></div>');
            break;
        }
      }
    });
  };

  $(document).bind('DOMNodeInserted', function (event) {
    if ($(event.target).hasClass('sectioned-item-list')) {
      $(event.target).find('.listFUTItem').each(function(index, item) {
        showFutbinPrice($(item));
      })
    }

    if ($(event.target).hasClass("listFUTItem")) {
      showFutbinPrice($(event.target));
    }
  });
})();
