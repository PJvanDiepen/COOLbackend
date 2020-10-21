'use strict'

const { Model } = require('objection')

class Speler extends Model {
  static get tableName() {
    return 'speler'
  }

  static get idColumn() { // primary key
    return ['seizoen','knsbNummer'];
  }

  static get relationMappings() {
    return {
      fk_speler_persoon: {
        relation: Model.BelongsToOneRelation,
        modelClass: Speler,
        join: {
          from: 'speler.knsbNummer',
          to: 'persoon.knsbNummer'
        }
      }
    }
  };
}

module.exports = Speler;