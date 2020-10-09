/* globals
services $
*/

export default {
  /**
   * Sleep for a while
   *
   * @param {number} min minimum sleep time in ms
   * @param {number} variance maximum variation to add to the minimum in ms
   */
  sleep(min, variance = 1000) {
    const delay = min + Math.floor(Math.random() * variance);
    // new Logger().log(`Delay for ${delay} (requested: ${min}+${variance})`, 'Core');
    return new Promise(resolve => setTimeout(resolve, delay));
  },

  getPlatform() {
    if (services.User.getUser().getSelectedPersona().isPlaystation) {
      return 'ps';
    }
    if (services.User.getUser().getSelectedPersona().isPC) {
      return 'pc';
    }
    if (services.User.getUser().getSelectedPersona().isXbox) {
      return 'xbox';
    }

    throw new Error('unknown platform');
  },

  updateTitle(title, keepOriginalTitle) {
    const keepOriginalTitleTmp = (typeof keepOriginalTitle === 'undefined') ? true : keepOriginalTitle;
    const $h1 = $('.ut-tab-bar-view h1');

    if (keepOriginalTitleTmp) {
      $h1.attr('data-original-title', $h1.text());
      $h1.text(`${$h1.text()} - ${title}`);
    } else {
      $h1.text(title);
    }
  },

  restoreTitle() {
    const $h1 = $('.ut-tab-bar-view h1');
    $h1.text($h1.attr('data-original-title'));
  },

};
