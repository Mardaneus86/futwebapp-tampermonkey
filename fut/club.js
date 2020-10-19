/* globals
transferobjects services enums communication factories UTItemEntity
UTSearchCriteriaDTO
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


  async search(searchCriteria) {
    return new Promise((resolve, reject) => {
      // Search in the club
      services.Item.searchClub(searchCriteria).observe(this, async function (obs, res) {
        if (!res.success) {
          obs.unobserve(this);
          reject(res.status);
        } else {
          let dateItems = res.data.items;
          dateItems = dateItems.filter(e =>
            !(e.isLoaned() || UTItemEntity.isAlex(e.id) ||
            UTItemEntity.isJim(e.id) || UTItemEntity.isDanny(e.id)));

          resolve(dateItems);
        }
      });
    });
  }

  async getPlayer(defId, useConceptPlayer) {
    return new Promise((resolve, reject) => {
      const searchCriteria = new UTSearchCriteriaDTO();
      const useConceptPlayerTmp = (typeof useConceptPlayer === 'undefined') ? true : useConceptPlayer;

      searchCriteria.type = enums.SearchType.PLAYER;
      searchCriteria.defId = [defId];

      // Search player in the club
      services.Item.searchClub(searchCriteria).observe(this, async function (obs, res) {
        if (!res.success) {
          obs.unobserve(this);
          reject(res.status);
        } else {
          let dateItems = res.data.items;
          dateItems = dateItems.filter(e =>
            !(e.isLoaned() || UTItemEntity.isAlex(e.id) ||
            UTItemEntity.isJim(e.id) || UTItemEntity.isDanny(e.id)));

          // If no result, maybe we search concept player
          if (dateItems.length < 1 && useConceptPlayerTmp) {
            dateItems = await new Club().getConceptPlayer(defId);
          }

          resolve(dateItems);
        }
      });
    });
  }

  async getConceptPlayer(defId) {
    return new Promise((resolve, reject) => {
      const searchCriteria = new UTSearchCriteriaDTO();

      searchCriteria.type = enums.SearchType.PLAYER;
      searchCriteria.defId = [defId];

      // Search concept player
      services.Item.searchConceptItems(searchCriteria).observe(this, function (obs, res) {
        if (!res.success) {
          obs.unobserve(this);
          reject(res.status);
        } else {
          let dateItems = res.data.items;
          dateItems = dateItems.filter(e =>
            !(e.isLoaned() || UTItemEntity.isAlex(e.id) ||
            UTItemEntity.isJim(e.id) || UTItemEntity.isDanny(e.id)));

          resolve(dateItems);
        }
      });
    });
  }
}
