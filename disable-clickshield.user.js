// ==UserScript==
// @name        FUT Disable Clickshield
// @version     0.1.1
// @description Removes the black shield screen when an action is running. Especially useful when running the other FUT scripts that perform requests in the background
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/disable-clickshield.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/disable-clickshield.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function() {
  'use strict';
  components.ClickShield.prototype.showShield = function(t) {
  };
})();
