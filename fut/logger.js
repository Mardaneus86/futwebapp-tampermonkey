export class Logger {
  constructor() {
    this._storeName = 'logger';
  }

  log(message, category = 'FUT') {
    /* eslint-disable no-console */
    console.log(`${category}: ${message}`);
    /* eslint-enable no-console */
    const log = JSON.parse(GM_getValue(this._storeName, '[]'));
    log.push(`${category}: ${message}`);
    GM_setValue(this._storeName, JSON.stringify(log));
  }

  reset() {
    GM_setValue(this._storeName, '[]');
  }
}
