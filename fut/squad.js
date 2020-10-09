/* globals
services
*/
export class Squad {
  static getCurrentSquadIds() {
    return new Promise(async (resolve) => {
      services.Squad.requestSquadById(services.Squad.getActiveSquadId())
        .observe(this, function (e, t) {
          e.unobserve(this);
          const i = {
            defIds: [],
          };
          i.defIds = t.success ? t.data.squad.getPlayers()
            .map(d => d.getItem().getDefId(), this) : [];
          const res = t;
          res.data = i;
          resolve(res);
        });
    });
  }
}
