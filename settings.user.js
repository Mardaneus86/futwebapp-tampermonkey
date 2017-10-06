// ==UserScript==
// @name        FUT Settings Page
// @version     0.1.1
// @description Add overall settings for the other scripts
// @license     MIT
// @author      Tim Klingeleers
// @match       https://www.easports.com/fifa/ultimate-team/web-app/*
// @match       https://www.easports.com/*/fifa/ultimate-team/web-app/*
// @namespace   https://github.com/Mardaneus86
// @updateURL   https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/settings.user.js
// @downloadURL https://raw.githubusercontent.com/Mardaneus86/futwebapp-tampermonkey/master/settings.user.js
// @supportURL  https://github.com/Mardaneus86/futwebapp-tampermonkey/issues
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==
// ==OpenUserJS==
// @author Mardaneus86
// ==/OpenUserJS==
(function () {
  'use strict';

  gAuthenticationModel.addListener(models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL, this, function () {

    pages.AppSettingsAlt = function () {
      pages.AppSettings.call(this);
    };

    utils.JS.inherits(pages.AppSettingsAlt, pages.AppSettings);

    pages.controllers.AppSettingsAltController = function (view) {
      pages.controllers.AppSettingsController.call(this, view);
      this._viewmodel = null;
    };
    utils.JS.inherits(pages.controllers.AppSettingsAltController, pages.controllers.AppSettingsController);
    pages.controllers.AppSettingsAltController.prototype.onScreenStarted = function () {
      Object.getPrototypeOf(this.constructor.prototype).onScreenStarted.call(this);

      var settings = GM_getValue('settings', '{}');
      settings = JSON.parse(settings);

      this._view.$_root.find('.l-boot-base').css('width', '50%');
      this._view.$_root.append(`
        <div class="p-boot-base l-boot-base ExtraSettingsWrapper" style="width: 50%;left: 50%;/* position: relative; */">
          <div class="p-settings l-settings boot-box">
            <div class="boot-content-container">
              <div class="boot-primary-content">
                <div class="layout-article boot-content">
                  <h1>Tampermonkey settings</h1>
                  <form action="#" id="tampermonkey-settings">
                    <label for="ifttt_maker_key">IFTTT Maker Key (<a href="https://ifttt.com/maker_webhooks" target="blank">info</a>)</label>
                    <input type="text" id="ifttt_maker_key" name="ifttt_maker_key">
                    <input type="submit" value="Save">
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>`
      );

      $('#ifttt_maker_key').val(settings.ifttt_maker_key);

      $('#tampermonkey-settings').on('submit', function (e) {
        var formData = new FormData(e.currentTarget);
        var settings = {};
        formData.forEach(function (value, key) {
          settings[key] = value;
        });

        GM_setValue('settings', JSON.stringify(settings));
        localStorage.setItem('ifttt_maker_key', settings.ifttt_maker_key);
        return false;
      });
    };

    Screens.Register("APP_SETTINGS", "AppSettingsAlt", Screens.APP_SECTION.SETTINGS, "Settings");
  });
})();
