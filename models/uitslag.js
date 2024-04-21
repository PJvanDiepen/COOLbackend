"use strict"

const { Model } = require("objection")

class Uitslag extends Model {
    static tableName = "uitslag";

    static idColumn = ["clubCode", "seizoen","teamCode","rondeNummer","knsbNummer"]; // primary key
}

module.exports = Uitslag;