'use strict'

const { Model } = require('objection')

class Person extends Model {
  static get tableName() {
    return 'spelers'
  }
}

module.exports = Person