'use strict'

const { Model } = require('objection')

class Uitslag extends Model {
    static tableName = 'uitslag';

    static idColumn = ['seizoen','teamCode','rondeNummer','knsbNummer']; // primary key
}

module.exports = Uitslag;