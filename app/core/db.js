/* eslint valid-typeof: "error" */

export class Database {
  constructor() {
    this.set('database-version', '1');
  }

  static set(key, value) {
    GM_setValue(key, value);
  }

  static setJson(key, value) {
    this.set(key, JSON.stringify(value));
  }

  static get(key, defaultValue) {
    let value = defaultValue;
    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return GM_getValue(key, value);
  }

  static getJson(key, defaultValue) {
    return JSON.parse(this.get(key, defaultValue));
  }
}
