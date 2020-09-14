'use strict'

const { Model } = require('objection')

class Speler extends Model {
  static get tableName() {
    return 'speler'
  }

  static get idColumn() { // primary key
    return ['seizoen','knsbNummer'];
  }
}

module.exports = Speler;