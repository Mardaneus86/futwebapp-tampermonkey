/* globals PIN_PAGEVIEW_EVT_TYPE services PINEventType */

export class PinEvent {
  static sendPageView(pageId, delay = 2000) {
    return new Promise(resolve =>
      setTimeout(() => {
        services.PIN.sendData(PINEventType.PAGE_VIEW, {
          type: PIN_PAGEVIEW_EVT_TYPE,
          pgid: pageId,
        });
        resolve();
      }, delay));
  }
}
