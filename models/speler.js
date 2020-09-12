'use strict'

const { Model } = require('objection')

class Speler extends Model {
  static get tableName() {
    return 'speler'
  }

  static get idColumn() {
    return ['seizoen','knsbNummer']; // primary key
  }
}

module.exports = Speler;