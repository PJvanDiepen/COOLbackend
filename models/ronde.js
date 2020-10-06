'use strict'

const { Model } = require('objection')

class Ronde extends Model {
    static get tableName() {
        return 'ronde';
    }

    static get idColumn() { // primary key
        return ['seizoen','knsbNummer','rondeNummer'];
    }
}

module.exports = Ronde;