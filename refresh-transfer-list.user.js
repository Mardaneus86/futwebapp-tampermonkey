// ==UserScript==
// @name        FUT Refresh Transfer List
// @version     0.1.3
// @description Refresh Transfer List
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/refresh-transfer-list.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/refresh-transfer-list.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  $(document).bind('DOMNodeInserted', function (event) {
    switch (gNavManager.getCurrentScreen()._screenId) {
      case "TradePile":
      case "SearchResults":
      case "MyClubSearch":
        if ($('#header .subTitle').find('.refreshList').length === 0) {
          $('#header').find('.subTitle').append('<a class="btn-flat next refreshList" style="float: right">Refresh list</a>');
          $('.refreshList').click(function () {
            gNavManager.getCurrentScreenController()._controller._listController._requestItems();
          });
        }
        break;
    }
  });
})();
