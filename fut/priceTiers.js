/* global utils components */
export default {
  roundValueToNearestPriceTiers(value) {
    const tier = utils.JS.find(components.NumericInput.PRICE_TIERS, i => value > i.min);

    const diff = value % tier.inc;

    if (diff === 0) {
      return value;
    } else if (diff < tier.inc / 2) {
      return value - diff;
    }
    return value + (tier.inc - diff);
  },

  roundDownToNearestPriceTiers(value) {
    const tier = utils.JS.find(components.NumericInput.PRICE_TIERS, i => value > i.min);

    const diff = value % tier.inc;

    if (diff === 0) {
      return value - tier.inc;
    }
    return value - diff;
  },

  determineListPrice(start, buyNow) {
    const tier = utils.JS.find(components.NumericInput.PRICE_TIERS, i => buyNow > i.min);

    const startPrice = this.roundValueToNearestPriceTiers(start);
    let buyNowPrice = this.roundValueToNearestPriceTiers(buyNow);

    if (startPrice === buyNowPrice) {
      buyNowPrice += tier.inc;
    }

    return {
      start: startPrice,
      buyNow: buyNowPrice,
    };
  },
};
