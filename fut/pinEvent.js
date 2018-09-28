/* globals PIN_PAGEVIEW_EVT_TYPE services enums */

export class PinEvent {
  static sendPageView(pageId, delay = 2000) {
    return new Promise(resolve =>
      setTimeout(() => {
        services.PIN.sendData(enums.PIN.EVENT.PAGE_VIEW, {
          type: PIN_PAGEVIEW_EVT_TYPE,
          pgid: pageId,
        });
        resolve();
      }, delay));
  }
}
