"use strict"

const { Model } = require("objection")

class Rating extends Model {
    static tableName = "rating";

    static idColumn = ["maand","knsbNummer"];  // primary key
}

module.exports = Rating;