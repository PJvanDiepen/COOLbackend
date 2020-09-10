'use strict'

const { Model } = require('objection')

class Persoon extends Model {
    static get tableName() {
        return 'persoon'
    }
}

module.exports = Persoon