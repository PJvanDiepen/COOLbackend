'use strict'

const { Model } = require('objection')

class Ronde extends Model {
    static tableName = 'ronde';

    static idColumn = ['seizoen','teamCode','rondeNummer']; // primary key
}

module.exports = Ronde;