// ==UserScript==
// @name        FUT Autobuyer
// @version     0.1.1
// @description Automatically search and buy items matching search criteria, currenly based on max buy now value
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/autobuyer.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/autobuyer.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_notification
// @grant       window.focus
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==

(function () {
  'use strict';

  GM_setValue('log', ''); // clear the log on restart
  GM_setValue('isSearching', false);

  var addMessage = function addMessage(msg) {
    var oldLog = GM_getValue('log', '');
    var message = "[" + new Date() + "] " + msg + "\n";
    GM_setValue('log', oldLog + message);
    $('#progressAutobuyer').val(oldLog + message);
    scrollLogToBottom();
  };

  var scrollLogToBottom = function scrollLogToBottom() {
    var log = $('#progressAutobuyer');
    if (log.length) {
      log.scrollTop(log[0].scrollHeight - log.height());
    }
  };

  var isNotExactTraining = function isExactTraining(crit) {
    if (crit.category === enums.SearchCategory.POSITION) {
      return crit.position === "any";
    } else if (crit.category === enums.SearchCategory.PLAYSTYLE) {
      return crit.playStyle === -1;
    } else {
      return true; // can't search specific enough on the rest of the categories
    }
  };

  // page
  pages.Autobuyer = function () {
    pages.Search.call(this);
    this.updateHeader(components.Header.DEFAULT_CHILD_PAGE, "Auto buyer");
    this.$_root.find('.tabletButtons').append('<div style="padding: 0; float: left;" role="button" class="btn btn-raised"><span id="snipeButton" style="padding: 16px;" class="btn-text">Disable Player Restriction</span><span class="btn-subtext invisible"></span></div>');
    this.$_root.find('.search-container').css('width', '50%');
    var log = GM_getValue('log', '');
    this.$_root.append('<article class="SearchWrapper" style="width: 50%; left: 50%"><textarea id="progressAutobuyer" style="width: 100%;height: 98%;">' + log + '</textarea></article>');
    scrollLogToBottom();
  };

  utils.JS.inherits(pages.Autobuyer, pages.Search);

  // controller
  pages.controllers.AutobuyerController = function (view) {
    pages.controllers.SearchController.call(this, view);
    this._viewmodel = new viewmodels.BucketedItemSearch();
    this._isSearching = GM_getValue('isSearching', false);
  };

  utils.JS.inherits(pages.controllers.AutobuyerController, pages.controllers.SearchController);

  pages.controllers.AutobuyerController.prototype._isSearching = false;

  // Get snipeMode value. If is True on reset i will let the button active just for better UX.
  
  var snipeMode = function getSnipeType(){
    return(GM_getValue('snipeMode'));
  };

  pages.controllers.AutobuyerController.prototype.onScreenStarted = function () {
    Object.getPrototypeOf(this.constructor.prototype).onScreenStarted.call(this);

    this._view._searchButton1.$_text.text(this._isSearching ? "Cancel" : "BIN snipe");
    if(snipeMode()){
      $('#snipeButton').parent().addClass('active');
    }
    scrollLogToBottom();
  };

  pages.controllers.AutobuyerController.prototype.onSearchButtonClicked = function () {
    if (this._viewmodel.searchCriteria.maxBuy === 0) {
      addMessage("Can't BIN snipe without a max buy now value");
      return;
    }

    console.log(this._viewmodel.searchCriteria);
    //Add a new case. If snipeMode don't allow to autobuy without playername set on.
    if (this._viewmodel.searchCriteria.type === "player" && !this._viewmodel.searchCriteria.maskedDefId && !snipeMode() ||
      this._viewmodel.searchCriteria.type === "training" && isNotExactTraining(this._viewmodel.searchCriteria) ||
      this._viewmodel.searchCriteria.type === "clubInfo" && (this._viewmodel.searchCriteria.club === -1 && this._viewmodel.searchCriteria.league === -1) ||
      this._viewmodel.searchCriteria.type === "staff" && this._viewmodel.searchCriteria.category === "any") {
      addMessage("Can't BIN snipe without a specific item");
      return;
    }
    this._isSearching = !this._isSearching;

    if (this._isSearching) {
      this._view._searchButton1.$_text.text("Cancel");
    } else {
      addMessage('Cancelled search');
      GM_setValue('searchStartDate', null);
      clearTimeout(GM_getValue('searchTimeoutHandle'));
      this._view._searchButton1.$_text.text('BIN snipe');
    }

    GM_setValue('isSearching', this._isSearching);

    var startSearch = function startSearch(searchCriteria, controller) {
      // TODO: need a better way to do RPM limiting
      var delay = 0;
      var runningTime = new Date().getTime() - GM_getValue('searchStartDate');
      if (runningTime > 1 * 60 * 60 * 1000) { // if search has been started more than 1 hours ago
        addMessage('Running for 1h, waiting for an hour to prevent Captcha');
        GM_getValue('searchStartDate', new Date());
        delay = 60 * 60 * 1000; // wait an hour
      } else {
        // randomly wait between 10 and 30 seconds
        delay = (Math.floor(Math.random() * 20)) * 500;
      }

      GM_setValue('searchTimeoutHandle',
        setTimeout(function () {
          var o = new communication.SearchAuctionDelegate(searchCriteria);
          o.addListener(communication.BaseDelegate.SUCCESS, this, function marketSearch(sender, response) {
            var rareItems = response.auctionInfo;
            if (rareItems && rareItems.length > 0) {
              rareItems.forEach(function (i, index) {
                var bid = new communication.BidDelegate(i.tradeId, i.buyNowPrice);
                bid.addListener(communication.BaseDelegate.SUCCESS, this, function _bidSuccess(sender, response) {
                  addMessage(i.tradeId + ' bought for ' + i.buyNowPrice);

                  GM_notification({
                    text: "Item bought for " + i.buyNowPrice,
                    title: "FUT 18 Web App",
                    onclick: function () { window.focus(); },
                  });
                });
                bid.addListener(communication.BaseDelegate.FAIL, this, function _bidFailure(sender, response) {
                  addMessage('Failed to buy ' + i.tradeId + ' for ' + i.buyNowPrice);
                });
                bid.send();
              });
            } else {
              addMessage('No items found on market, retrying...');
            }

            startSearch(searchCriteria, controller);
          });
          o.addListener(communication.BaseDelegate.FAIL, this, function marketSearchFailure(sender, response) {
            var reason = JSON.stringify(response);

            if (reason._code === enums.HTTPStatusCode.RATE_LIMIT) {
              addMessage('Rate limit reached while searching, cancelling');
            } else if (
              reason._code === enums.HTTPStatusCode.NO_INTERNET_CONNECTION ||
              reason._code === enums.HTTPStatusCode.NETWORK_ERROR ||
              reason._code === enums.HTTPStatusCode.REQUEST_TIME_OUT
            ) {
              addMessage('Network error, retrying...');
              startSearch(searchCriteria, controller);
            } else if (
              reason._code === enums.HTTPStatusCode.FUN_CAPTCHA_REQUIRED ||
              reason._code === enums.HTTPStatusCode.CAPTCHA_REQUIRED) {
              addMessage('Captcha is required, cancelling');
            } else {
              addMessage('Something went wrong while searching, cancelling: ' + JSON.stringify(response));
            }


          });
          o.send();
        }, delay)
      );
    };

    if (this._isSearching) {
      var t = gAuthenticationModel.getUser().marketSearchCriteria;
      t.update(this._viewmodel.searchCriteria);
      t.maskedDefId = 0;

      GM_setValue('searchStartDate', new Date().getTime());

      var searchCriteria = this._viewmodel.searchCriteria;
      addMessage("Starting search");
      startSearch(searchCriteria, this);    
    }
  };

  // Add a button for sniping without select any player.
  // I will store locally a variable. If this variable is set to TRUE the user will not be alerted anymore for his choice.

  GM_setValue('snipeModeNotified', false);

  var snipeModeNotified = function getSnipeModeAlert(){
    return(GM_getValue('snipeModeNotified'));
  };

  // If snipeMode is set to false or not exist I will set it to false.
  // Else I will set the button to active. Just for UX.
  if(!snipeMode()){
    GM_setValue('snipeMode', false);
  } else{
    $('#snipeButton').parent().addClass('active');
  }

  if(!snipeModeNotified()){
    GM_setValue('snipeModeNotified', false);
  }

  //Simple JavaScript. Add a class for UX and toggle on and off the snipeMode variable.
  //Case snipeMode == TRUE : allow to autobuy without a player name set on.
  //Case snipeMode == FALSE : default behaviour.

  document.addEventListener('click', function(e){
    if(e.target.id == 'snipeButton'){
      var snipeBtn = e.target.parentNode;
      if(!snipeMode()){
        // Set snipe value to true.
        GM_setValue('snipeMode', true);
        $(snipeBtn).addClass('active');

        if(!snipeModeNotified()){
          //If confirm nothing else will be notified, else run as usually and notified again later.
          if (confirm("You've disabled the player restriction. With this mode enabled you can search for Role or for Quality without choose a Player name. If you don't want to read it anymore, you just have to say OK.")) {
            GM_setValue('snipeModeNotified', true);
          }
        }
      } else {
        GM_setValue('snipeMode', false);
        $(snipeBtn).removeClass('active');
      }
    }
  });

  Screens.Register('AUTOBUYER', 'Autobuyer', "AUTO_BUYER");

  // TODO: find a cleaner way to add new navigation buttons in the sidebar
  gFooter._btnAutobuyer = new components.FooterButton();
  gFooter._btnAutobuyer.getRootElement().classList.add("btnTransfers");
  gFooter.__root.appendChild(gFooter._btnAutobuyer.getRootElement());
  gFooter._btnAutobuyer.init();
  gFooter._btnAutobuyer.setText("Autobuyer");
  gFooter._btnAutobuyer.addTarget(gFooter, function () {
    gNavManager.requestRootScreen(Screens.getView('AUTOBUYER'));
    gFooter._btnAutobuyer.addClass(enums.UIState.SELECTED);
  }, enums.Event.TAP);

  // Override default selection logic for side navigation bar
  components.Footer.prototype._onScreenRequested = function _onScreenRequested(t, i, s, o) {
    return s === NavManager.SCREEN_TYPE.ROOT ? (this._btnHome.toggleClass(enums.UIState.SELECTED, i === Screens.getView("HOME")),
      this._btnSquads.toggleClass(enums.UIState.SELECTED, i === Screens.getView("SQUADS_HUB")),
      this._btnSBC.toggleClass(enums.UIState.SELECTED, i === Screens.getView("SBC_HUB")),
      this._btnTransfers.toggleClass(enums.UIState.SELECTED, i === Screens.getView("TRANSFERS_HUB")),
      this._btnStore.toggleClass(enums.UIState.SELECTED, i === Screens.getView("STORE_HUB")),
      this._btnClub.toggleClass(enums.UIState.SELECTED, i === Screens.getView("CLUB_HUB")),
      this._btnSettings.toggleClass(enums.UIState.SELECTED, i === Screens.getView("APP_SETTINGS")),
      this._btnAutobuyer.toggleClass(enums.UIState.SELECTED, i === Screens.getView("AUTOBUYER"))) : o !== Screens.APP_SECTION.SETTINGS;
  };
})();
