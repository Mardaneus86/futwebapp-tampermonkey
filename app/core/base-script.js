/* global window */
/* eslint class-methods-use-this: "off" */
import { Settings } from './settings';
import { Database } from './db';

export class BaseScript {
  constructor(id) {
    this._id = id;

    Settings.getInstance().on('entry-enabled', (entry) => {
      if (entry.id === id) {
        this.screenRequestObserver = window.onPageNavigation.observe(
          this,
          function (obs, event) {
            setTimeout(() => {
              this.onScreenRequest(event);
            }, 1000);
          },
        );

        this.activate({
          screenId: window.currentPage,
        });
      }
    });

    Settings.getInstance().on('entry-disabled', (entry) => {
      if (entry.id === id) {
        this.screenRequestObserver.unobserve(this);

        this.deactivate({
          screenId: window.currentPage,
        });
      }
    });
  }

  activate() {
    // override in subclasses
  }

  deactivate() {
    // override in subclasses
  }

  onScreenRequest() {
    // override in subclasses
  }

  getSettings() {
    return Database.getJson(`settings:${this._id}`, {});
  }
}
