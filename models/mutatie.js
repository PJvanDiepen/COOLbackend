'use strict'

const { Model } = require('objection')

class Mutatie extends Model {
    static tableName = 'mutatie';

    static idColumn = 'knsbNummer'; // primary key
}

module.exports = Mutatie