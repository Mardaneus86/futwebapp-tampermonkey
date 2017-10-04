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
  var showFutbinPrice = function showFutbinPrice(target, futbinData) {
    if (!futbinData) {
      return;
    }
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
    
    if (!futbinData[playerId]) {
      return; // futbin data might not be available for this player
    }

    if (target.find('.futbin').length > 0) {
      return; // futbin price already added to the row
    }
    
    var targetForButton = null;
    switch(gNavManager.getCurrentScreen()._screenId) {
      case "TradePile":
      case "MyClubSearch":
        $(".secondary.player-stats-data-component").css('float', 'left');
        targetForButton = target.find('.entityContainer');
        targetForButton.append('<div class="auction futbin" style="margin: 0; width: auto;"><span class="label">Futbin BIN</span><span class="coins value">' + futbinData[playerId].prices[platform].LCPrice + '</span></div>');
        break;
      case "SearchResults":
        if (!futbinData[playerId]) {
          debugger;
        }
        targetForButton = target.find('.auctionValue').parent();
        targetForButton.prepend('<div class="auctionValue futbin"><span class="label">Futbin BIN</span><span class="coins value">' + futbinData[playerId].prices[platform].LCPrice + '</span></div>');
        break;
    };
  };

  var initialised = false;
  var lastIndex = -1;
  var index = 0;
  var lastScreen = "";
  var intervalRunning = null;

  gNavManager.onScreenRequest.observe(this, function(obs, event) {
      switch(event) {
        case "TradePile":
        case "MyClubSearch":
        case "SearchResults":
          if(initialised) {
            return;
          }
          intervalRunning = setInterval(function() {
            var controller = gNavManager.getCurrentScreenController()._controller;
            
            if (lastScreen === event && 
              lastIndex === index) {
              return;
            }

            lastScreen = event;
            lastIndex = index;
            
            if (!controller ||
                !controller._listController ||
                !controller._listController._view) {
              return; // only run if data is available
            }

            var listrows = null;
            if (controller._listController._view._list &&
                controller._listController._view._list._listRows &&
                controller._listController._view._list._listRows.length > 0) {
              listrows = controller._listController._view._list._listRows; // for transfer market and club search
            } else if (controller._listController._view._listRows &&
                controller._listController._view._listRows.length > 0) {
              listrows = controller._listController._view._listRows; // for trade pile
            }

            if (listrows === null) {
              return;
            }

            // do we have navigation?
            if (controller._listController._view.addTarget) {
              // TODO: can we get the index in a better way? right now the viewmodel page index stays 0 while paging occurs
              controller._listController._view.addTarget(this, function() { index++ }, enums.UIPaginationEvent.NEXT);
              controller._listController._view.addTarget(this, function() { index-- }, enums.UIPaginationEvent.PREVIOUS);
            }

            var uiItems = gNavManager.getCurrentScreen().$_root.find('.listFUTItem');
            
            var futbinUrl = "https://www.futbin.com/18/playerPrices?player=&all_versions=" + listrows.
              map(function(i) { return i.data._metaData.id}).
              filter(function(current, next) { return current !== next}).
              join(',')
            GM_xmlhttpRequest({
              method: "GET",
              url: futbinUrl,
              onload: function (res) {
                var futbinData = JSON.parse(res.response);
                uiItems.each(function(index, item) {
                  showFutbinPrice($(item), futbinData);
                })
              }
            });
            initialised = true;
          }, 1000);
          break;

        default:
          // no need to search prices on other pages
          // reset page
          initialised = false;
          lastIndex = -1;
          if (intervalRunning) {
            clearInterval(intervalRunning);
          }
          intervalRunning = null;
          break;
      }
  });
})();
