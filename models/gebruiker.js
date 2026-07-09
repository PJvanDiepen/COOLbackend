"use strict"

const { Model } = require("objection")

class Gebruiker extends Model {
    static tableName = "gebruiker";

    static idColumn = "uuidToken"; // primary key
}

module.exports = Gebruiker;