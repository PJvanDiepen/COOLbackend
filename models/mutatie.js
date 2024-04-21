"use strict"

const { Model } = require("objection")

class Mutatie extends Model {
    static tableName = "mutatie";

    static idColumn = ["tijdstip","volgnummer"];  // primary key
}

module.exports = Mutatie;