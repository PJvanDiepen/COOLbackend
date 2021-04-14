'use strict'

const { Model } = require('objection')

class Speler extends Model {
  static tableName = 'speler';

  static idColumn = ['seizoen','knsbNummer'];  // primary key
}

module.exports = Speler;