'use strict'

const { Model } = require('objection')

class Team extends Model {
    static tableName = 'team';

    static idColumn = ['seizoen','teamCode'];  // primary key

}

module.exports = Team;