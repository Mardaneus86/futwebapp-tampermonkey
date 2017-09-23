// ==UserScript==
// @name         instant-transfer-search
// @namespace    https://www.easports.com/
// @version      0.1
// @description  Instantly go to the Transfer Search
// @author       Tim Klingeleers
// @match        https://www.easports.com/fifa/ultimate-team/web-app/*
// @grant        GM_xmlhttpRequest
// @connect      *
// ==/UserScript==
(function() {
  'use strict';
  getStorage().setItem("deepLinkURL", enums.DeepLinkSections.AUCTION);
})();
