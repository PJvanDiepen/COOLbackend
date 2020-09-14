'use strict'

const { Model } = require('objection')

class Speler extends Model {
  static get tableName() {
    return 'speler'
  }

  static get idColumn() { // primary key
    return ['seizoen','knsbNummer'];
  }

  /*static relationMappings = {
    fk_speler_persoon: {
      relation: Model.BelongsToOneRelation,
      modelClass: Persoon,
      join: {
        from: 'speler.knsbNummer',
        to: 'persoon.knsbNummer'
      }
    }
  };*/
}

module.exports = Speler;