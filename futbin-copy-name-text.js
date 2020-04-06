// ==UserScript==
// @name         Futbin Copy Name Text
// @version      0.1
// @description  This will copy the name text on a player so its easy to seach for them
// @author       darthvader666uk
// @match        *://www.futbin.com/*
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @grant        GM_setClipboard
// @run-at       document-end
// ==/UserScript==

/* globals jQuery, $, waitForKeyElements */

var $ = window.jQuery;

waitForKeyElements (".pcdisplay-name", getNodeText);

function getNodeText (jNode) {
    var targText = jNode.text ().trim ();

    console.log ("Copied to clipboard: ", targText);
    GM_setClipboard (targText);
}