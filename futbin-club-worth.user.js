// ==UserScript==
// @name        FUT Futbin Club Worth
<<<<<<< HEAD
// @version     0.2
=======
// @version     0.1.3
>>>>>>> bf74f93799a5aa7c5a2754176834f5d6aeaa3ed4
// @description Determines the club worth based on current Futbin BIN prices
// @license     MIT
// @author      Tim Klingeleers, Kyderman
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @grant       GM_xmlhttpRequest
// @connect     www.futbin.com
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/futbin-club-worth.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/futbin-club-worth.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';
  gNavManager.onScreenRequest.observe(this, function (obs, event) {
    if (event === "MyClubSearch") {
      var platform = '';
      if (repositories.User.getCurrent().getSelectedPersona().isPlaystation) platform = "ps";
      if (repositories.User.getCurrent().getSelectedPersona().isPC) platform = "pc";
      if (repositories.User.getCurrent().getSelectedPersona().isXbox) platform = "xbox";

      setTimeout(function () {
<<<<<<< HEAD
=======
        $('.MyClubResults .paginated-item-list').css('top', '120px'); // make sure top pagination bar stays visible
>>>>>>> bf74f93799a5aa7c5a2754176834f5d6aeaa3ed4
        $('.MyClubResults').prepend(`
        <div class="clubValue"><button class="list" style="cursor: default">
        <span class="btn-text">Total Futbin Club Value:</span>
        <span class="btn-subtext">Calculating, please wait...</span>
        </div>`);
        
        calculatePageWorth(platform, 0, 90);
      }, 1000);
    }
    
    var calculatePageWorth = function calculatePageWorth(platform, start, count, total) {
      if (!total) {
        total = 0;
      }
      
      var t = new transferobjects.SearchCriteria();
      t.type = enums.SearchType.PLAYER;

      var o = new communication.ClubSearchDelegate(t, start, count);
      o._useClickShield = false;
      o.send();

      o.addListener(communication.BaseDelegate.SUCCESS, this, function marketSearch(sender, response) {
        var playerIds = Object.keys(response.itemData).map(function (key) { if (!response.itemData[key].untradeable) { return response.itemData[key].resourceId; } }).filter(function(x) {return x != undefined});
        if (playerIds.length < 1) {
          console.log("club total calculation complete.");
          $('.clubValue .btn-subtext').html(`${total}`);
        } else {
          var futbinUrl = "https://www.futbin.com/18/playerPrices?player=&all_versions=" + playerIds.join(',');
          GM_xmlhttpRequest({
            method: "GET",
            url: futbinUrl,
            onload: function (res) {
              var futbinData = JSON.parse(res.response);
              var clubWorth = playerIds.map(function (key) {
                if (futbinData[key]) {
                  return parseInt(futbinData[key].prices[platform].LCPrice.replace(/,/g, ""));
                } else {
                  return parseInt(0);
                }
              }).reduce(function (a, b) {
                return a + b;
              }, 0);
              
              total += clubWorth;
              
              setTimeout(function () {
                calculatePageWorth(platform, start + count, count, total);
              }, 1000); // delay for requesting from futbin again
            }
          });
        }
      });
    }
  });
})();
