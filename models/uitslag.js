'use strict'

const { Model } = require('objection')

class Uitslag extends Model {
    static get tableName() {
        return 'uitslag';
    }

    static get idColumn() { // primary key
        return ['seizoen','knsbNummer','rondeNummer','knsbNummer'];
    }
}

module.exports = Uitslag;