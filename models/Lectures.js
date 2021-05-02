const mongoose = require("mongoose");
const { PostsSchema } = require("./Posts");

const LecturesSchema = mongoose.Schema({
    lectureName: String,
    active: Boolean,
    posts: [PostsSchema]
})

const Lectures = mongoose.model("Lectures", LecturesSchema);

module.exports = { LecturesSchema, Lectures };
