"use strict"

const { Model } = require("objection")

class Team extends Model {
    static tableName = "team";

    static idColumn = ["clubCode", "seizoen","teamCode"];  // primary key
}

module.exports = Team;