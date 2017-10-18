// ==UserScript==
// @name        FUT Show Futbin player price
// @version     0.2.7
// @description Show the Futbin prices for players in the Search Results, Club Search and Trade Pile
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
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
  $('head').append(`<style id="addedCSS" type="text/css">
  #TradePile .player-stats-data-component, #Unassigned .player-stats-data-component {
    width: 12em;
  }
  #TradePile .listFUTItem .entityContainer, #Unassigned .listFUTItem .entityContainer {
    width: 45%;
  }
  #Unassigned .listFUTItem .auction .auctionValue, #Unassigned .listFUTItem .auction .auction-state {
    display: none;
  }
  #Unassigned .listFUTItem .auction .auctionValue.futbin {
    display: block;
    float: right;
  }

  .MyClubResults .listFUTItem .auction {
    display: block;
    position: absolute;
    right: 0;
  }
  .MyClubResults .listFUTItem .auction .auctionValue, .MyClubResults .listFUTItem .auction .auction-state {
    width: 24%;
    float: right;
    padding-right: 1%;
    display: none;
  }
  .MyClubResults .listFUTItem .auction .auctionValue.futbin {
    display: block;
  }
  .listFUTItem .auction .auction-state {
    width: 25%;
    float: right;
  }
  .listFUTItem .auction .auctionValue {
    width: 24%;
    float: left;
    padding-right: 1%;
  }
  .futbinupdate {
    font-size: 14px;
    clear: both;
    display: block;
  }
  .coins.value.futbin {
    -webkit-filter: hue-rotate(165deg);
    filter: hue-rotate(165deg);
  }
  </style>`);

  var showFutbinPrice = function showFutbinPrice(item, futbinData) {
    if (!futbinData) {
      return;
    }
    var target = $(item.target);
    var playerId = item.playerId;

    if (target.find('.player').length === 0) {
      // not a player
      return;
    }

    var platform = '';
    if (repositories.User.getCurrent().getSelectedPersona().isPlaystation) platform = "ps";
    if (repositories.User.getCurrent().getSelectedPersona().isPC) platform = "pc";
    if (repositories.User.getCurrent().getSelectedPersona().isXbox) platform = "xbox";

    if (!futbinData[playerId]) {
      return; // futbin data might not be available for this player
    }

    if (target.find('.futbin').length > 0) {
      return; // futbin price already added to the row
    }

    var targetForButton = null;
    switch (gNavManager.getCurrentScreen()._screenId) {
      case "UnassignedItems":
      case "TradePile":
      case "MyClubSearch":
        $(".secondary.player-stats-data-component").css('float', 'left');
        targetForButton = target.find('.auction');
        targetForButton.show();
        targetForButton.prepend('<div class="auctionValue futbin"><span class="label">Futbin BIN <span class="futbinupdate">(' + futbinData[playerId].prices[platform].updated + ')</span></span><span class="coins value">' + futbinData[playerId].prices[platform].LCPrice + '</span></div>');
        break;
      case "SearchResults":
        targetForButton = target.find('.auctionValue').parent();
        targetForButton.prepend('<div class="auctionValue futbin"><span class="label">Futbin BIN <span class="futbinupdate">(' + futbinData[playerId].prices[platform].updated + ')</span></span><span class="coins value">' + futbinData[playerId].prices[platform].LCPrice + '</span></div>');
        break;
    };
  };

  var intervalRunning = null;

  gNavManager.onScreenRequest.observe(this, function (obs, event) {
    switch (event) {
      case "MyClubSearchFilters":
      case "UnassignedItems":
      case "TradePile":
      case "MyClubSearch":
      case "SearchResults":
        if (intervalRunning) {
          clearInterval(intervalRunning);
        }
        intervalRunning = setInterval(function () {
          var controller = gNavManager.getCurrentScreenController()._controller;

          var uiItems = gNavManager.getCurrentScreen().$_root.find('.listFUTItem');

          if ($(uiItems[0]).find('.futbin').length > 0) {
            return;
          }

          var listController = null;
          if (event == "UnassignedItems") {
            if (!controller ||
              !controller._leftController ||
              !controller._leftController._view) {
              return;
            }
            listController = controller._leftController
          } else {
            if (!controller ||
              !controller._listController ||
              !controller._listController._view) {
              return; // only run if data is available
            }
            listController = controller._listController
          }

          var listrows = null;
          if (listController._view._list &&
            listController._view._list._listRows &&
            listController._view._list._listRows.length > 0) {
            listrows = listController._view._list._listRows; // for transfer market and club search
          } else if (listController._view._listRows &&
            listController._view._listRows.length > 0) {
            listrows = listController._view._listRows; // for trade pile
          }

          if (listrows === null) {
            return;
          }

          var resourceIdMapping = [];
          listrows.forEach(function (row, index) {
            resourceIdMapping.push({
              target: uiItems[index],
              playerId: row.data.resourceId
            });
          });

          var futbinUrl = "https://www.futbin.com/18/playerPrices?player=&all_versions=" + resourceIdMapping.
            map(function (i) { return i.playerId }).
            filter(function (current, next) { return current !== next }).
            join(',');
          GM_xmlhttpRequest({
            method: "GET",
            url: futbinUrl,
            onload: function (res) {
              var futbinData = JSON.parse(res.response);
              resourceIdMapping.forEach(function (item) {
                showFutbinPrice(item, futbinData);
              })
            }
          });
        }, 1000);
        break;

      default:
        // no need to search prices on other pages
        // reset page
        if (intervalRunning) {
          clearInterval(intervalRunning);
        }
        intervalRunning = null;
        break;
    }
  });
})();
