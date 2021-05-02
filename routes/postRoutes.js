const express = require("express");
const { Courses } = require("../models/Courses");
const { Lectures } = require("../models/Lectures");
const { Posts } = require("../models/Posts");
const postRoutes = express.Router();

postRoutes.get("/GetPosts", async (req, res) => {
    try {
        const posts = await Posts.find({ type: "post" });
        res.json(posts);
    } catch (err) {
        res.json({ error: err });
    }
});

postRoutes.get("/GetReplies", async (req, res) => {
    try {
        const replies = await Posts.find({ type: "reply" });
        res.json(replies);
    } catch (err) {
        res.json({ error: err });
    }
});

postRoutes.post("/CreatePost", async (req, res) => {
    const { lectureID, author, content } = req.body;
    try {
        // make sure lecture exists
        const lecture = await Lectures.findById(lectureID);
        if (!lecture) {
            res.json({ error: "No lecture found with that ID" });
            return;
        }

        // save post
        const post = new Posts({
            author,
            content,
            likes: 0,
            type: "post",
            replies: []
        });
        const savedPost = await post.save();

        // add post to respective lecture
        let posts = [...lecture.posts];
        posts.push(savedPost);
        await Lectures.updateOne(
            { _id: lectureID },
            { $set: { posts } }
        )

        // add updated lecture to course
        await Courses.findOneAndUpdate(
            { "lectures._id": lectureID },
            { $set: { "lectures.$.posts": posts }}
        )

        res.json(savedPost);
    } catch (err) {
        res.json({ error: err });
    }
});

postRoutes.post("/LikePost", async (req, res) => {
    let { postID } = req.body;
    try {
        const post = await Posts.findById(postID);
        if (!post) {
            res.json({ error: "No post with that ID found" });
            return;
        }

        const updatedPost = await Posts.updateOne(
            { _id: postID },
            { likes: post.likes + 1 }
        )

        // add updated lecture to course
        await Lectures.findOneAndUpdate(
            { "posts._id": postID },
            { $set: { "posts.$.likes": post.likes + 1 }}
        )

        const lecture = await Lectures.findOne({ "posts._id": postID });

        // add updated lecture to course
        await Courses.findOneAndUpdate(
            { "lectures._id": lecture._id },
            { $set: { "lectures.$.posts": lecture.posts }}
        )

        res.json(updatedPost);
    } catch(err) {
        res.json({ error: err });
    }
});

postRoutes.post("/CreateReply", async (req, res) => {
    const { postID, author, content } = req.body;
    try {
        // make sure post exists
        const post = await Posts.findById(postID);
        if (!post) {
            res.json({ error: "No post found with that ID" });
            return;
        }

        // save reply
        const reply = new Posts({
            author,
            content,
            likes: 0,
            type: "reply",
            replies: []
        });
        const savedReply = await reply.save();

        // add reply to respective post
        let replies = [...post.replies];
        replies.push(savedReply._id);
        await Posts.updateOne(
            { _id: postID },
            { $set: { replies } }
        )

        res.json(savedReply);
    } catch (err) {
        res.json({ error: err });
    }
});

module.exports = postRoutes;