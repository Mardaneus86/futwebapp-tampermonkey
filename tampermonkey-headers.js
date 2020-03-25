// ==UserScript==
// @name        FUT Enhancer
// @version     1.6.4
// @description Enhances the FIFA Ultimate Team 20 Web app. Includes Futbin integration and other useful tools
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_notification
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       window.focus
// @connect     ea.com
// @connect     futbin.com
// @connect     google-analytics.com
// @updateURL   https://github.com/Mardaneus86/futwebapp-tampermonkey-web/raw/master/downloads/FUT_Enhancer.meta.js
// @downloadURL https://github.com/Mardaneus86/futwebapp-tampermonkey-web/raw/master/downloads/FUT_Enhancer.user.js
// @require     http://code.jquery.com/jquery-3.4.1.min.js
// @run-at      document-idle
// ==/UserScript==

var $ = window.jQuery;
