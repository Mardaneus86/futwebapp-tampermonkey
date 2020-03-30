// ==UserScript==
// @name         Futbin Copy Name Text
// @version      0.1
// @description  This will copy the name text on a player so its easy to seach for them
// @author       snightingale
// @match        *://www.futbin.com/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

var $ = window.jQuery;

var targText = $(".full-name").text ().trim ();

console.log ("Copied to clipboard: ", targText);
GM_setClipboard (targText);