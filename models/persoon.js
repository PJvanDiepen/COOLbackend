'use strict'

const { Model } = require('objection')

class Persoon extends Model {
    static get tableName() {
        return 'persoon';
    }

    static get idColumn() {
        return 'knsbNummer'; // primary key
    }
}

module.exports = Persoon