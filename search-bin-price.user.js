// ==UserScript==
// @name        FUT Search BIN
// @version     0.1.3
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
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';
  const START_BIN_SEARCH = 9999999999;
  const SEARCH_COUNT = 30;

  $(document).bind('DOMNodeInserted', function (event) {
    if ($(event.target).hasClass("DetailPanel")) {
      if ($(event.target).find('#searchMinBin').length === 0) {
        $(event.target).find('.bidOptions').append('<button class="standard" id="searchMinBin">Search min BIN</button>');
        $(event.target).find('.QuickListPanel').append('<button class="standard" id="searchMinBin">Search min BIN</button>');
        $('#searchMinBin').click(function () {
          var playerImageUrl = $('.listFUTItem.selected').find('.photo').attr('src');
          var playerId = playerImageUrl.substr(playerImageUrl.lastIndexOf('/') + 1).replace('.png', '');

          searchdata = {
            minimumBIN: START_BIN_SEARCH,
            itemData: gNavManager.getCurrentScreenController()._controller._itemDetailController._currentController._getViewIteratorItems().current,
            searchCriteria: new transferobjects.SearchCriteria
          };
          
          searchdata.searchCriteria.count = SEARCH_COUNT,
          searchdata.searchCriteria.maskedDefId = searchdata.itemData.getMaskedResourceId();
          searchdata.searchCriteria.type = searchdata.itemData.type;
          // if it is TOTW or other special, set it to TOTW. See enums.ItemRareType. Can only search for "Specials", not more specific on Rare Type
          var rareflag = searchdata.itemData.rareflag > enums.ItemRareType.TOTW ? enums.ItemRareType.TOTW : searchdata.itemData.rareflag; 
          var level = factories.DataProvider.getItemLevelDP(true).filter(d => d.id == rareflag)[0].value;
          searchdata.searchCriteria.level = level;
          searchdata.searchCriteria.category = enums.SearchCategory.ANY;
          searchdata.searchCriteria.position = enums.SearchType.ANY;

          search(searchdata).observe(this, handleSearch);
        });
      }
    }
  });

  var searchdata = {};
  var handleSearch = function handleSearch(sender, data) {
    if (data.items.length > 0) {
      var newMinimumBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
      var delay = Math.floor(Math.random() * 3000) + 2000;
      if (newMinimumBIN < searchdata.minimumBIN) {
        setTimeout(function () { 
          searchdata.minimumBIN = newMinimumBIN;
          search(searchdata).observe(this, handleSearch); 
        }, delay);
      } else if (data.items.length == SEARCH_COUNT) {
        // all results are the same price, so make min price a little less        
        setTimeout(function () { 
          searchdata.minimumBIN = new components.NumericInput().getIncrementBelowVal(searchdata.minimumBIN);
          search(searchdata).observe(this, handleSearch); 
        }, delay);
      } else {
        var lowestBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
        GM_notification({
          text: "Minimum BIN found for " + searchdata.itemData._staticData.name + " is " + lowestBIN,
          title: "FUT 18 Web App",
          timeout: 5000,
          onclick: function () { window.focus(); },
        });
      }
    } else {
      var lowestBIN = searchdata.minimumBIN;
      GM_notification({
        text: "Minimum BIN found for " + searchdata.itemData._staticData.name + " is " + lowestBIN,
        title: "FUT 18 Web App",
        timeout: 5000,
        onclick: function () { window.focus(); },
      });
    }
  };

  var search = function search(data) {
    var maxBuy = data.minimumBIN;
    if (data.minimumBIN === START_BIN_SEARCH) {
      maxBuy = 0;
    }

    data.searchCriteria.maxBuy = maxBuy;

    return repositories.TransferMarket.search(data.searchCriteria);
  };
})();
