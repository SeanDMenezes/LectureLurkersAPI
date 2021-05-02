const express = require("express");
const { Users } = require("../models/Users");
const { Courses } = require("../models/Courses");
const { deleteLecture } = require("../api/lecture-api");
const courseRoutes = express.Router();

courseRoutes.get("/GetCourses", async (req, res) => {
    try {
        const courses = await Courses.find();
        res.json(courses);
    } catch (err) {
        res.json({ error: err });
    }
});

courseRoutes.post("/GetCourse", async (req, res) => {
    const { courseID } = req.body;
    try {
        const course = await Courses.findById(courseID);
        if (!course) {
            res.json({ error: "No course with that ID found" });
            return;
        }
        res.json(course);
    } catch (err) {
        res.json({ error: err });
    }
});

courseRoutes.post("/GetCourseUsers", async (req, res) => {
    const { courseID } = req.body;
    try {
        const course = await Courses.findById(courseID);
        if (!course) {
            res.json({ error: "No course with that ID found" });
            return;
        }
        const users = await Users.find({ '_id': { $in: course.studentIDs } });
        res.json(users);
    } catch (err) {
        res.json({ error: err });
    }
});

courseRoutes.post("/CreateCourse", async (req, res) => {
    const { userID, courseName } = req.body;
    try {
        // no duplicate course names
        if (await Courses.findOne({ courseName })) {
            res.json({ error: "Course with that name already exists" });
            return;
        }

        // only teachers can create courses
        const user = await Users.findById(userID);
        if (!user) {
            res.json({ error: "No users with that ID found" });
            return;
        }
        if (user.role !== "teacher") {
            res.json({ error: "Only teachers can create new courses" });
            return;
        }
        
        // generate ID to join course for students
        let joinID = Array.from(Array(8), () => Math.floor(Math.random() * 36).toString(36)).join('');
        joinID = joinID.toUpperCase();
        
        // save course
        const course = new Courses({
            ownerID: userID,
            courseName,
            joinID,
            lectures: [],
            studentIDs: []
        });
        const savedCourse = await course.save();
        res.json(savedCourse);
    } catch (err) {
        res.json({ error: err });
    }
});

courseRoutes.post("/DeleteCourse", async (req, res) => {
    const { courseID } = req.body;
    try {
        const course = await Courses.findById(courseID);
        for (let i = 0; i < course.lectures.length; ++i) {
            const lectureID = course.lectures[i]._id;
            await deleteLecture(lectureID);
        }

        let removed = await Courses.deleteOne({ _id: courseID });
        res.json(removed);
    } catch (err) {
        res.json({ error: err });
    }
});

module.exports = courseRoutes;