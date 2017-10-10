// ==UserScript==
// @name        FUT Show Contracts and Fitness
// @version     0.1.3
// @description Show contract and fitness value instantly in search list
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/show-contract-fitness.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/show-contract-fitness.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  $('head').append(`
  <style id="addedCSS" type="text/css">
    .item.player.small.TOTW .infoTab, 
    .item.player.small.OTW .infoTab, 
    .item.player.small.TOTS .infoTab, 
    .item.player.small.TOTY .infoTab, 
    .item.player.small.legend .infoTab {
      color: white;
    }

    .item.player.small .infoTab {
      color: black;
      top: 5%;
      right: 0;
      width: 100%;
      height: 22%;
      line-height: 165%;
    }
  </style>`);

  var targetNodes         = $(document);
  var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
  var myObserver          = new MutationObserver (mutationHandler);
  var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true };
  
  targetNodes.each ( function () {
      myObserver.observe (this, obsConfig);
  } );
  
  function mutationHandler (mutationRecords) {
    mutationRecords.forEach ( function (mutation) {
      if ($(mutation.target).hasClass("listFUTItem")) {
        var controller = gNavManager.getCurrentScreenController()._controller;
        if (!controller || !controller._listController) {
          return;
        }

        var items = controller._listController._viewmodel._collection;
        var rows = $('.listFUTItem');
        rows.each(function (index, row) {
          $(row).find('.infoTab').html(
            '<div class="fitness" style="float: right;margin-right: 20px">' +
            items[index].fitness +
            '</div>' +
            '<div class="contracts" style="margin-left: 30px;float: left">' +
            items[index].contract +
            '</div>'
          );
        });
      }
    });
  }
})();
