import uuid from 'uuid';
import ua from '../../analytics';

import { Database } from './db';

class Analytics {
  constructor() {
    if (this.ua === undefined) {
      let id = Database.get('uuid', '');
      if (id === '') {
        id = uuid.v4();
        Database.set('uuid', id);
      }

      this.ua = ua(null, null, {
        tid: UA_TOKEN,
        cid: id,
        uid: id,
      });
    }
  }

  trackPage(pageId) {
    return new Promise((resolve, reject) => {
      this.ua.pageview(pageId, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  trackEvent(category, action, label = null, value = null) {
    return new Promise((resolve, reject) => {
      this.ua.event(category, action, label, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export default new Analytics();
