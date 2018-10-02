/* globals onVisibilityChanged services FUINavigationController UTObservable window document $ */
import 'babel-polyfill';
import './index.scss';
import initSettingsScreen from './settings';

import { analytics, Settings, Queue } from './core';

import { Logger } from '../fut';
/*
  CardInfoSettings,
  RefreshListSettings,
  RemoveSoldAuctionsSettings,
  RelistAuctionsSettings,
*/
import {
  ListSizeSettings,
  MinBinSettings,
} from './transferlist';

import {
  FutbinSettings,
} from './futbin';

import {
  InstantBinConfirmSettings,
} from './instant-bin-confirm';
/*
import {
  ClubInfoSettings,
} from './club';
*/

window.onPageNavigation = new UTObservable();
window.currentPage = '';

FUINavigationController.prototype.didPush = (t) => {
  if (t) {
    analytics.trackPage(t.className);
    window.onPageNavigation.notify(t.className);
    window.currentPage = t.className;
  }
};

services.Authentication._oAuthentication.observe(
  this,
  () => {
    // reset the logs at startup
    new Logger().reset();

    // force full web app layout in any case
    $('body').removeClass('phone').addClass('landscape');

    Queue.getInstance().start();

    // get rid of pinEvents when switching tabs
    document.removeEventListener('visibilitychange', onVisibilityChanged);

    const settings = Settings.getInstance();
    // settings.registerEntry(new RefreshListSettings());
    // settings.registerEntry(new RemoveSoldAuctionsSettings());
    // settings.registerEntry(new RelistAuctionsSettings());
    settings.registerEntry(new MinBinSettings());
    // settings.registerEntry(new CardInfoSettings());
    settings.registerEntry(new ListSizeSettings());

    settings.registerEntry(new FutbinSettings());
    settings.registerEntry(new InstantBinConfirmSettings());
    // settings.registerEntry(new ClubInfoSettings());

    initSettingsScreen(settings);
  },
);
