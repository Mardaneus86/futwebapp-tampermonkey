import { utils } from '../../fut';

export class Queue {
  constructor() {
    this._queue = [];
  }

  static getInstance() {
    if (this._instance == null) {
      this._instance = new Queue();
    }

    return this._instance;
  }

  add(identifier, cb) {
    this._queue.push({
      identifier,
      cb,
    });
  }

  async start() {
    this._running = true;
    /* eslint-disable no-await-in-loop */
    while (this._running) {
      if (this._queue.length > 0) {
        const scriptToRun = this._queue.shift();
        if (scriptToRun) {
          await scriptToRun.cb();
        }
      } else {
        await utils.sleep(1000);
      }
    }
    /* eslint-enable no-await-in-loop */
  }

  stop() {
    this._running = false;
  }
}
