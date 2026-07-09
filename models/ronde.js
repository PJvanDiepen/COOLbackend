"use strict"

const { Model } = require("objection")

class Ronde extends Model {
    static tableName = "ronde";

    static idColumn = ["clubCode", "seizoen", "teamCode", "rondeNummer"]; // primary key
}

module.exports = Ronde;