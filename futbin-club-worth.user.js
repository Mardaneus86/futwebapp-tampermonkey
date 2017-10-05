// ==UserScript==
// @name        FUT Futbin Club Worth
// @version     0.2
// @description Determines the club worth based on current Futbin BIN prices
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
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

    gNavManager.onScreenRequest.observe(this, function(obs, event) {
        if(event === "MyClubSearch") {
            var currentCount = 0;
            var currentTotal = 0;
            setTimeout(function(){
              $('.MyClubResults').prepend(`
              <div class="clubValue"><button class="list" style="cursor: default">
              <span class="btn-text">Total Futbin Club Value:</span>
              <span class="btn-subtext">Calculating, please wait...</span>
              </div>`);
            }, 1000);
            var gettingPlayerData = setInterval(function() {
                var t = new transferobjects.SearchCriteria();
                t.type = enums.SearchType.PLAYER;
                var o = new communication.ClubSearchDelegate(t, currentCount, 90);
                components.ClickShield.prototype.showShield = function(t) {
                };
                currentCount += 90;
                o.addListener(communication.BaseDelegate.SUCCESS, this, function marketSearch(sender, response) {
                    var playerIds = Object.keys(response.itemData).map(function(key) { if(!response.itemData[key].untradeable){return response.itemData[key].resourceId;}});
                    if(response.itemData.length < 1) {
                        clearInterval(gettingPlayerData);
                        console.log("done");
                         $('.clubValue .btn-subtext').html(`${currentTotal}`);
                    }
                    var futbinUrl = "https://www.futbin.com/18/playerPrices?player=&all_versions=" + playerIds.join(',');
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
                                    return parseInt(futbinData[key].prices[platform].LCPrice.replace(/,/g, ""));
                                } else {
                                    return parseInt(0);
                                }
                            }).reduce(function(a, b) {
                               return a + b;
                            }, 0);
                            currentTotal += clubWorth;
                        }
                    });
                });
                o.send();
            }, 1000);
        }
    });
})();
