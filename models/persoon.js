'use strict'

const { Model } = require('objection')

class Persoon extends Model {
    static tableName = 'persoon';

    static idColumn = 'knsbNummer'; // primary key
}

module.exports = Persoon;