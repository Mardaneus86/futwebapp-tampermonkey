/* globals
transferobjects enums communication factories
*/

export class Club {
  async getPlayers(start, count) {
    return new Promise((resolve, reject) => {
      const t = new transferobjects.SearchCriteria();
      t.type = enums.SearchType.PLAYER;

      const o = new communication.ClubSearchDelegate(t, start, count);
      o._useClickShield = false;

      o.addListener(communication.BaseDelegate.SUCCESS, this, (sender, response) => {
        sender.clearListenersByScope(this);

        const players = Array.isArray(response.itemData) ?
          factories.Item.generateItemsFromItemData(response.itemData) : [];
        const isLastPage = players.length <= count - 1;
        resolve({
          isLastPage,
          getNextPage: isLastPage ? null : () => this.getPlayers(start + count, count),
          players,
        });
      });

      o.addListener(communication.BaseDelegate.FAIL, this, (sender, response) => {
        sender.clearListenersByScope(this);
        reject(response);
      });

      o.send();
    });
  }
}
