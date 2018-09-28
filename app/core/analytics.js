import ua from '../../analytics';

import { Database } from './db';

class Analytics {
  constructor() {
    if (this.ua === undefined) {
      let id = Database.get('uuid', '');
      if (id === '') {
        id = this._uuidv4();
        Database.set('uuid', id);
      }

      this.ua = ua(null, null, {
        tid: UA_TOKEN,
        cid: id,
        uid: id,
      });
    }
  }

  /* eslint-disable */
  _uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  /* eslint-enable */

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
