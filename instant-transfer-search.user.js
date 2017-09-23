// ==UserScript==
// @name        FUT Instant Transfer Search
// @version     0.1
// @description Instantly go to the Transfer Search
// @license     MIT
// @author      Tim Klingeleers
// @match        https://www.easports.com/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @grant       GM_xmlhttpRequest
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/GitHub-userscripts/master/instant-transfer-search.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/GitHub-userscripts/master/instant-transfer-search.user.js
// ==/UserScript==
(function() {
  'use strict';
  getStorage().setItem("deepLinkURL", enums.DeepLinkSections.AUCTION);
})();
