const express = require("express");
const { deleteLecture } = require("../api/lecture-api");
const { Courses } = require("../models/Courses");
const { Lectures } = require("../models/Lectures");
const lectureRoutes = express.Router();

lectureRoutes.get("/GetLectures", async (req, res) => {
    try {
        const courses = await Lectures.find();
        res.json(courses);
    } catch (err) {
        res.json({ error: err });
    }
});

lectureRoutes.post("/GetLecture", async (req, res) => {
    let { lectureID } = req.body;
    try {
        const lecture = await Lectures.findById(lectureID);
        if (!lecture) {
            res.json({ error: "No lecture found with that ID" });
            return;
        }
        res.json(lecture);
    } catch (err) {
        res.json({ error: err });
    }
});

lectureRoutes.post("/GetCourseLectures", async (req, res) => {
    let { courseID } = req.body;
    try {
        const course = await Courses.findById(courseID);
        if (!course) {
            res.json({ error: "No course with that ID found" });
        } else {
            res.json(course.lectures);
        }
    } catch (err) {
        res.json({ error: err });
    }
});

lectureRoutes.post("/CreateLecture", async (req, res) => {
    const { courseID, lectureName } = req.body;
    try {
        // make sure that the course exists
        const course = await Courses.findById(courseID);
        if (!course) {
            res.json({ error: "Invalid Course ID" });
            return;
        }
        
        // no duplicate lecture names in same course
        if (course.lectures.includes(lectureName)) {
            res.json({ error: "Lecture with that name already exists" });
            return;
        }
        
        // save new lecture
        const lecture = new Lectures({
            lectureName,
            active: false,
            posts: [],
        });
        const savedLecture = await lecture.save();

        // add lecture to respective course
        let lectures = [...course.lectures];
        lectures.push(savedLecture);
        await Courses.updateOne(
            { _id: courseID },
            { $set: { lectures } }
        )

        res.json(savedLecture);
    } catch (err) {
        res.json({ error: err });
    }
});

lectureRoutes.post("/ResumeLecture", async (req, res) => {
    const { lectureID } = req.body;
    try {
        let updatedLecture = await Lectures.findByIdAndUpdate(
            lectureID,
            { $set: { active: true }}
        )

        await Courses.findOneAndUpdate(
            { "lectures._id": lectureID },
            { $set: { "lectures.$.active": true } }
        )

        res.json(updatedLecture);
    } catch (err) {
        res.json({ error: err });
    }
});

lectureRoutes.post("/EndLecture", async (req, res) => {
    const { lectureID } = req.body;
    try {
        let updatedLecture = await Lectures.findByIdAndUpdate(
            lectureID,
            { $set: { active: false }}
        )

        await Courses.findOneAndUpdate(
            { "lectures._id": lectureID },
            { $set: { "lectures.$.active": false } }
        )

        res.json(updatedLecture);
    } catch (err) {
        res.json({ error: err });
    }
});

lectureRoutes.post("/DeleteLecture", async (req, res) => {
    const { lectureID } = req.body;
    try {
        await Courses.findOneAndUpdate(
            { "lectures._id": lectureID },
            { $pull: { lectures: { _id: lectureID }}},
            { new: true }
        )

        let removed = await deleteLecture(lectureID);
        res.json(removed);
    } catch (err) {
        res.json({ error: err });
    }
});

module.exports = lectureRoutes;