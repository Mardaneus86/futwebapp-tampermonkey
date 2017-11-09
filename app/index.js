/* globals models onVisibilityChanged gAuthenticationModel document $ */
import 'babel-polyfill';

import initSettingsScreen from './settings';

import { Settings, Queue } from './core';

import { Logger } from '../fut';

import {
  CardInfoSettings,
  RefreshListSettings,
  RemoveSoldAuctionsSettings,
  RelistAuctionsSettings,
  MinBinSettings,
  ListSizeSettings,
} from './transferlist';

import {
  FutbinSettings,
} from './futbin';

import {
  ClubInfoSettings,
} from './club';

gAuthenticationModel.addListener(
  models.AuthenticationModel.EVENT_AUTHENTICATION_SUCCESSFUL,
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
    settings.registerEntry(new RefreshListSettings());
    settings.registerEntry(new RemoveSoldAuctionsSettings());
    settings.registerEntry(new RelistAuctionsSettings());
    settings.registerEntry(new MinBinSettings());
    settings.registerEntry(new CardInfoSettings());
    settings.registerEntry(new ListSizeSettings());

    settings.registerEntry(new FutbinSettings());
    settings.registerEntry(new ClubInfoSettings());

    initSettingsScreen(settings);
  },
);
