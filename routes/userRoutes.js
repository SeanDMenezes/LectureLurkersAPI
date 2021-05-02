const express = require("express");
const { Users } = require("../models/Users");
const { Courses } = require("../models/Courses");
const userRoutes = express.Router();

userRoutes.get("/GetUsers", async (req, res) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (err) {
        res.json({ error: err });
    }
});

userRoutes.post("/GetUser", async (req, res) => {
    const { userID } = req.body;
    try {
        const user = await Users.findById(userID);
        if (!user) {
            res.json({ error: "No user with that ID can be found" });
            return;
        }
        res.json(user);
    } catch (err) {
        res.json({ error: err });
    }
})

userRoutes.post("/GetUserCourses", async (req, res) => {
    const { userID } = req.body;
    try {
        let courses = await Courses.find().or([
            { ownerID: userID },
            { studentIDs: userID }
        ])
        res.json(courses);
    } catch (err) {
        res.json({ error: err });
    }
})

userRoutes.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password)
    try {
        const user = await Users.findOne({ username });
        if (user) {
            if (password === user.password) {
                res.json(user);
            } else {
                res.json({ error: "Invalid password" });
            }
        } else {
            res.json({ error: "Invalid username" })
        }
    } catch (err) {
        res.json({ error: err });
    }
});
    
userRoutes.post("/CreateUser", async (req, res) => {
    const { username, password, role } = req.body;
    try {
        // no duplicate usernames
        if (await Users.findOne({ username })) {
            res.json({ error: "User with that name already exists" });
            return;
        }
        
        // save user
        const user = new Users({
            username,
            password,
            role
        });
        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
        res.json({ error: err });
    }
});

userRoutes.post("/JoinCourse", async (req, res) => {
    const { userID, joinID } = req.body;
    try {
        // make sure course exists
        const course = await Courses.findOne({ joinID });
        if (!course) {
            res.json({ error: "Invalid ID given" });
            return;
        }

        // make sure user isn't already in the course
        if (course.studentIDs.includes(userID)) {
            res.json({ error: "User is already enrolled in this course" });
            return;
        }

        // make sure user exists and has student role
        const user = await Users.findById(userID);
        if (!user) {
            res.json({ error: "No user with that ID found"});
            return;
        }
        if (user.role !== "student") {
            res.json({ error: "Only students can join new courses" });
        }

        // add user to respective course
        let studentIDs = [...course.studentIDs];
        studentIDs.push(userID);
        const updatedCourse = await Courses.updateOne(
            { _id: course._id },
            { $set: { studentIDs } }
        )
        res.json(updatedCourse);
    } catch (err) {
        res.json({ error: err });
    }
});

module.exports = userRoutes;
