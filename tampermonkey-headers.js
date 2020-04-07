// ==UserScript==
// @name        FUT Enhancer
// @version     1.6.5
// @description Enhances the FIFA Ultimate Team 20 Web app. Includes Futbin integration and other useful tools
// @license     MIT
// @author      Tim Klingeleers, darthvader666uk
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @namespace   https://github.com/darthvader666uk
// @supportURL  https://github.com/darthvader666uk/futwebapp-tampermonkey/pulls
// @grant       GM_notification
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_setClipboard
// @grant       window.focus
// @connect     ea.com
// @connect     futbin.com
// @connect     google-analytics.com
// @updateURL   https://github.com/darthvader666uk/futwebapp-tampermonkey-web/raw/master/downloads/FUT_Enhancer.meta.js
// @downloadURL https://github.com/darthvader666uk/futwebapp-tampermonkey-web/raw/master/downloads/FUT_Enhancer.user.js
// @require     http://code.jquery.com/jquery-3.4.1.min.js
// @run-at      document-idle
// ==/UserScript==

/* globals jQuery, $ */

var $ = window.jQuery;
