'use strict'

const { Model } = require('objection')

class Persoon extends Model {
    static get tableName() {
        return 'persoon';
    }

    static get idColumn() { // primary key
        return 'knsbNummer';
    }
}

module.exports = Persoon