const mongoose = require("mongoose");
const { LecturesSchema } = require("./Lectures");

const CoursesSchema = mongoose.Schema({
    ownerID: mongoose.Schema.Types.ObjectId,
    courseName: String,
    joinID: String,
    lectures: [LecturesSchema],
    studentIDs: [mongoose.Schema.Types.ObjectId]
});

const Courses = mongoose.model("Course", CoursesSchema);

module.exports = { CoursesSchema, Courses };
