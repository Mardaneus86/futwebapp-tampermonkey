// ==UserScript==
// @name        FUT Refresh Transfer List
// @version     0.1
// @description Refresh Transfer List
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/refresh-transfer-list.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/refresh-transfer-list.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==

(function() {
  'use strict';

  $(document).bind('DOMNodeInserted', function(event) {
    if ($(event.target).hasClass("SearchResults")) {
      if ($(event.target).find('#refreshList').length === 0) {
        $(event.target).find('.pagingContainer').append('<a class="btn-flat pagination next" style="float: right" id="refreshList">Refresh</a>');
        $('#refreshList').click(function() {
          gNavManager.getCurrentScreenController()._controller._listController._requestItems();
        });
      }
    }
  });
})();