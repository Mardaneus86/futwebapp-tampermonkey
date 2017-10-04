// ==UserScript==
// @name        FUT Futbin Club Worth
// @version     0.1
// @description Determines the club worth based on current Futbin BIN prices
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @grant       GM_xmlhttpRequest
// @connect     www.futbin.com
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/club-worth.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/club-worth.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  gNavManager.onScreenRequest.observe(this, function(obs, event) {
    if(event === "MyClubSearch") {
      var gettingPlayerData = setInterval(function() {
        var playersInClub = repositories.Item._club._players._collection;

        if (!playersInClub || Object.keys(playersInClub).length === 0) {
          return;
        }
        clearInterval(gettingPlayerData);

        var playerIds = Object.keys(playersInClub).map(function(key) { return playersInClub[key]._metaData.id});
        var futbinUrl = "https://www.futbin.com/18/playerPrices?player=&all_versions=" + playerIds.join(',')

        var platform = '';
        if (repositories.User.getCurrent().getSelectedPersona().isPlaystation) platform = "ps";
        if (repositories.User.getCurrent().getSelectedPersona().isPC) platform = "pc";
        if (repositories.User.getCurrent().getSelectedPersona().isXbox) platform = "xbox";
        GM_xmlhttpRequest({
          method: "GET",
          url: futbinUrl,
          onload: function (res) {
            var futbinData = JSON.parse(res.response);
            var clubWorth = playerIds.map(function(key) { 
              if (futbinData[key]) {
                return parseInt(futbinData[key].prices[platform].LCPrice);
              } else {
                return parseInt(0);
              }
            }).reduce(function(a, b) { 
              return a + b; 
            }, 0);
            
            $('.DetailView').prepend(`
            <div><button class="list" style="cursor: default">
              <span class="btn-text">Total Futbin Club Value:</span>
              <span class="btn-subtext">${clubWorth}</span>
            </div>`);
          }
        });
      }, 1000);
    }
  });
})();
