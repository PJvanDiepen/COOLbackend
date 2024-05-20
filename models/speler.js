"use strict"

const { Model } = require("objection")

class Speler extends Model {
    static tableName = "speler";

    static idColumn = ["clubCode", "seizoen", "teamCode", "knsbNummer"];  // primary key
}

module.exports = Speler;