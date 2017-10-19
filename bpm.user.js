// ==UserScript==
// @name        FUT BPM
// @version     0.1.0
// @description Bronze Pack Method
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @require     https://cdn.jsdelivr.net/bluebird/latest/bluebird.min.js
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/BPM.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/BPM.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_notification
// @grant       GM_xmlhttpRequest
// @connect     www.futbin.com
// @grant       window.focus
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  var packProcessedEvent = new Event('pack-processed');

  let expense = 0;
  let profitTrade = 0;
  let profitClub = 0;
  let profitSell = 0;

  window.addEventListener('pack-processed', function (e) { 
    expense += 400;
    buyBronzePack();
  }, false);

  window.addEventListener('keydown', function (ev) {
    const keyCode = ev.keyCode;
    switch (keyCode) {
      case 66 /* b */:
        expense += 400;
        buyBronzePack();
        break;
      default:
        break;
    }
  });

  function buyBronzePack() {
    repositories.Store.getPacks("CARDPACK", true).observe(this, function (obs, packs) {
      var bronzePack = packs.filter(function (p) { return p.id == 100; })[0];
      if (!bronzePack) {
        return;
      }

      gPinManager.trigger(utils.PinFactory.createEvent(enums.PIN.EVENT.PAGE_VIEW, {
        type: PinManager.PAGEVIEW_EVT_TYPE,
        pgid: "Hub - Store"
      }));

      bronzePack.purchase().observe(this, function (s, item, errorCode) {
        s.unobserve(this);
        console.log(item, errorCode);

        setTimeout(function () {
          gPinManager.trigger(utils.PinFactory.createEvent(enums.PIN.EVENT.PAGE_VIEW, {
            type: PinManager.PAGEVIEW_EVT_TYPE,
            pgid: "Unassigned Items - List View"
          }));
          repositories.Item.reset(enums.FUTItemPile.PURCHASED);
          repositories.Item.getUnassignedItems().observe(this, function (o, list) {
            o.unobserve(this);
            determineItemAction(list.items)
              .then(() => {
                console.log("all determined");
                setTimeout(function () {
                  var waitTime = sendToTradeList();
                  setTimeout(function () {
                    sendToClub();
                    setTimeout(function () {
                      discardItems();
                      tradePile = [];
                      sendToClubPile = [];
                      discardPile = [];
                      console.log("Profit on trade and quicksell: " + (profitTrade + profitSell));
                      console.log("Potential club profit: " + profitClub);
                      console.log("exp - trade: " + (profitTrade + profitSell - expense));
                      console.log("total inc club: " + (profitTrade + profitSell - expense + profitClub));
                      console.log('buying new pack in 30 seconds...');
                      setTimeout(function() {
                        console.log('buying new pack');
                        window.dispatchEvent(packProcessedEvent);
                      }, 5000);
                    }, 3000);
                  }, waitTime + 3000);
                }, 3000);
              });
          });
        }, 5000);
      });
    });
  }

  function processPlayer(player) {
    return new Promise(resolve => {
      var low = null;
      return searchPlayerMinBINReverse(player)
        .then((itemsFound) => {
          if (itemsFound > 0) {
            return resolve();
          } else {
            return searchPlayerMinBIN(player);
          }
        })
        .then((low) => {
          if (low === undefined) { low = 200; }
          
          if (player.duplicateId === 0) {
            if (low > 200) {
              let starting = low - 300;
              if(starting < player._itemPriceLimits.minPrice) {
                starting = player._itemPriceLimits.minPrice
              }
              low = new components.NumericInput().getIncrementBelowVal(low);
              return listItem(player, starting, low)
              .then(() => {
                profitTrade += (low) * 0.95;
                resolve(player.id); // handled already
              })
            } else {
              listFor(player, "club");
              profitClub += low;
              console.log("should send to club", player.type, player._staticData.name, player, low);
              resolve(player.id); // handled already
            }
          } else {
            if (low < 201) {
              listFor(player, "discard");
              console.log("should discard, duplicate and low cost", player.type, player._staticData.name, player, low);
              profitSell += player.discardValue;
              resolve(player.id);
            }
          }
          resolve(null);
        });
    });
  }

  function determineItemAction(items) {
    return new Promise(resolve => {
      var players = items.filter(function (i) { return i.type == "player"; });
      return Promise.mapSeries(players, function (player) {
        return processPlayer(player);
      })
      .then((handled) => {
        var rest = items.filter(function (i) { return handled.indexOf(i) === -1; });
        return resolve(sendToClubOrDiscard(rest));
      });
    });

  };

  function sendToClubOrDiscard(items) {
    return Promise.map(items, function (i) {
      if (i == null) {
        return;
      }
      switch (i.type) {
        case enums.ItemType.CONTRACT:
        case enums.ItemType.HEALTH:
        case enums.ItemType.TRAINING:
          listFor(i, "club");
          console.log('duplicate item, send to club', i.type, i);
          return;
      }

      switch (i.subtype) {
        case enums.ItemSubType.FREE_PACK:
        case enums.ItemSubType.FREE_COINS:
          console.log("redemption item, redeem", i.subtype, i);
          redeemItem(i);
          return;
      }

      if (i.duplicateId !== 0) {
        switch (i.type) {
          case enums.ItemType.BADGE:
          case enums.ItemType.BALL:
          case enums.ItemType.FITNESS_COACH:
          case enums.ItemType.GK_COACH:
          case enums.ItemType.HEAD_COACH:
          case enums.ItemType.KIT:
          case enums.ItemType.MANAGER:
          case enums.ItemType.PHYSIO:
          case enums.ItemType.STADIUM:
            listFor(i, "discard");
            profitSell += i.discardValue
            console.log('duplicate item, discard', i.type, i);
            break;

          case enums.ItemType.MISC:
            console.log('unsure what to do...', i.type, i);
            debugger;
        }
      } else if (i.type !== enums.ItemType.PLAYER) {
        // not a duplicate and not a player
        listFor(i, "club");
      } else {
        console.log("shouldnt be here");
      }
    });
  };

  var tradePile = [];
  var sendToClubPile = [];
  var discardPile = [];

  function listItem(item, starting, buyNow) {
    return new Promise(resolve => {
      var moveItem = new communication.MoveItemDelegate([item], enums.FUTItemPile.TRANSFER);
      moveItem.addListener(communication.BaseDelegate.SUCCESS, this, function sendToTradePile(sender, response) {
        sender.clearListenersByScope(this);
        console.log('sent item to tradepile before listing', item, response);
        var listItem = new communication.ListItemDelegate({
          itemId: item.id,
          startingBid: starting,
          buyNowPrice: buyNow,
          duration: 3600
        });
        listItem.addListener(communication.BaseDelegate.SUCCESS, this, function itemRedeemed(sender, response) {
          sender.clearListenersByScope(this);
          console.log("listed ", starting, buyNow , item._staticData.name);
          return resolve(true);
        });
        listItem.addListener(communication.BaseDelegate.FAIL, this, function itemRedeemed(sender, response) {
          sender.clearListenersByScope(this);
          console.log("failed to list", starting, buyNow ,  item._staticData.name);
          return resolve(true);
        });
        listItem.send();
      });
      moveItem.addListener(communication.BaseDelegate.FAIL, this, function sendToTradePile(sender, response) {
        sender.clearListenersByScope(this);
        console.log('did NOT sent item to tradepile', item, response);
      });
      moveItem.send();
    })
  }

  function listFor(item, type) {
    switch (type) {
      case "trade":
        tradePile.push(item);
        break;
      case "club":
        sendToClubPile.push(item);
        break;
      case "discard":
        discardPile.push(item);
        break;
      default:
        console.log("unknown pile");
    }
  }

  function redeemItem(i) {
    setTimeout(function () {
      var redeem = new communication.ConsumeUnlockableDelegate(i.id);
      redeem.addListener(communication.BaseDelegate.SUCCESS, this, function itemRedeemed(sender, response) {
        sender.clearListenersByScope(this);
        console.log("item redeemed");
      });
      redeem.addListener(communication.BaseDelegate.FAIL, this, function itemRedeemed(sender, response) {
        sender.clearListenersByScope(this);
        console.log("failed to redeem");
      });
      redeem.send();
    }, 1000);
  }

  function sendToTradeList() {
    console.log("sendToTradeList", tradePile);
    if (tradePile.length == 0) return;
    tradePile.map(function (item, index) {
      setTimeout(function () {
        var moveItem = new communication.MoveItemDelegate([item], enums.FUTItemPile.TRANSFER);
        moveItem.addListener(communication.BaseDelegate.SUCCESS, this, function sendToTradePile(sender, response) {
          sender.clearListenersByScope(this);
          console.log('sent item to tradepile', item, response);
        });
        moveItem.addListener(communication.BaseDelegate.FAIL, this, function sendToTradePile(sender, response) {
          sender.clearListenersByScope(this);
          console.log('did NOT sent item to tradepile', item, response);
        });
        moveItem.send();
      }, 1000 * index);
    });
    return tradePile.length * 1000;
  }

  function sendToClub() {
    console.log("sendToClub", sendToClubPile);
    if (sendToClubPile.length == 0) return;
    var moveItem = new communication.MoveItemDelegate(sendToClubPile, enums.FUTItemPile.CLUB);
    moveItem.addListener(communication.BaseDelegate.SUCCESS, this, function sendToTradePile(sender, response) {
      sender.clearListenersByScope(this);
      console.log('sent items to club', sendToClubPile, response);
    });
    moveItem.addListener(communication.BaseDelegate.FAIL, this, function sendToTradePile(sender, response) {
      sender.clearListenersByScope(this);
      console.log('did NOT sent items to club', sendToClubPile, response);
    });
    moveItem.send();
  }

  function discardItems() {
    console.log("discardItems", discardPile);
    if (discardPile.length == 0) return;

    services.Item.discard(discardPile).observe(this, function discards(obs, res) {
      obs.unobserve(this);
      console.log('discarded items', discardPile);
    });
  }

  function searchPlayerMinBINReverse(player) {
    return new Promise((resolve, reject) => {
      const START_BIN_SEARCH = 200;
      var search = function search(data) {
        data.searchCriteria.maxBuy = START_BIN_SEARCH;
        return repositories.TransferMarket.search(data.searchCriteria);
      };

      var handleSearch = function handleSearch(sender, data) {
        return resolve(data.items.length);
      };

      var searchdata = {
        itemData: player,
        searchCriteria: new transferobjects.SearchCriteria()
      };

      searchdata.searchCriteria.count = 30;
      searchdata.searchCriteria.maskedDefId = searchdata.itemData.getMaskedResourceId();
      searchdata.searchCriteria.type = searchdata.itemData.type;

      // if it is TOTW or other special, set it to TOTW. See enums.ItemRareType. Can only search for "Specials", not more specific on Rare Type
      if (searchdata.itemData.rareflag > enums.ItemRareType.TOTW) {
        searchdata.searchCriteria.level = factories.DataProvider.getItemLevelDP(true).filter(d => d.id == enums.ItemRareType.TOTW)[0].value;
      }

      searchdata.searchCriteria.category = enums.SearchCategory.ANY;
      searchdata.searchCriteria.position = enums.SearchType.ANY;

      setTimeout(function() {
        search(searchdata).observe(this, handleSearch);
      }, 2000);
    });
  }

  function searchPlayerMinBIN(player) {
    return new Promise((resolve, reject) => {
      const START_BIN_SEARCH = 999999999;
      const SEARCH_COUNT = 30;
      var search = function search(data) {
        var maxBuy = data.minimumBIN;
        if (data.minimumBIN === START_BIN_SEARCH) {
          maxBuy = 0;
        }
        data.searchCriteria.maxBuy = maxBuy;
        return repositories.TransferMarket.search(data.searchCriteria);
      };

      var searchdata = {};
      var handleSearch = function handleSearch(sender, data) {
        if (data.items.length > 0) {
          var newMinimumBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
          var delay = Math.floor(Math.random() * 3000) + 2000;
          if (newMinimumBIN < searchdata.minimumBIN) {
            setTimeout(function () {
              searchdata.minimumBIN = newMinimumBIN;
              search(searchdata).observe(this, handleSearch);
            }, delay);
          } else if (data.items.length == SEARCH_COUNT) {
            // all results are the same price, so make min price a little less
            setTimeout(function () {
              searchdata.minimumBIN = new components.NumericInput().getIncrementBelowVal(searchdata.minimumBIN);
              search(searchdata).observe(this, handleSearch);
            }, delay);
          } else {
            var lowestBIN = Math.min.apply(Math, data.items.map(function (o) { return o._auction.buyNowPrice; }));
            return resolve(lowestBIN);
          }
        } else {
          var lowestBIN = searchdata.minimumBIN;
          return resolve(lowestBIN);
        }
      };

      searchdata = {
        minimumBIN: START_BIN_SEARCH,
        itemData: player,
        searchCriteria: new transferobjects.SearchCriteria()
      };

      searchdata.searchCriteria.count = SEARCH_COUNT;
      searchdata.searchCriteria.maskedDefId = searchdata.itemData.getMaskedResourceId();
      searchdata.searchCriteria.type = searchdata.itemData.type;

      // if it is TOTW or other special, set it to TOTW. See enums.ItemRareType. Can only search for "Specials", not more specific on Rare Type
      if (searchdata.itemData.rareflag > enums.ItemRareType.TOTW) {
        searchdata.searchCriteria.level = factories.DataProvider.getItemLevelDP(true).filter(d => d.id == enums.ItemRareType.TOTW)[0].value;
      }

      searchdata.searchCriteria.category = enums.SearchCategory.ANY;
      searchdata.searchCriteria.position = enums.SearchType.ANY;

      setTimeout(function() {
        search(searchdata).observe(this, handleSearch);
      }, 2000);

    });

  }
})();
