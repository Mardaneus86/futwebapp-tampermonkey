/* globals gPinManager PinManager utils enums */

export class PinEvent {
  static sendPageView(pageId, delay = 2000) {
    return new Promise(resolve =>
      setTimeout(() => {
        gPinManager.trigger(utils.PinFactory.createEvent(enums.PIN.EVENT.PAGE_VIEW, {
          type: PinManager.PAGEVIEW_EVT_TYPE,
          pgid: pageId,
        }));
        resolve();
      }, delay));
  }
}
