const { Posts } = require("../models/Posts");
const { Lectures } = require("../models/Lectures");
const { Courses } = require("../models/Courses");
const { Users } = require("../models/Users");

const createPost = async (lectureID, author, content) => {
    try {
        // make sure lecture exists
        const lecture = await Lectures.findById(lectureID);
        if (!lecture) {
            return { error: "No lecture found with that ID" };
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

        let posts = [...lecture.posts];
        posts.push(savedPost);

        const updatedLecture = await Lectures.findByIdAndUpdate(lectureID,
            { $set: { posts } },
            { new: true }
        );
        return updatedLecture;
    } catch (err) {
        return { error: err };
    }
}

const likePost = async (postID) => {
    try {
        const post = await Posts.findById(postID);
        if (!post) {
            res.json({ error: "No post with that ID found" });
            return;
        }

        const updatedPost = await Posts.findByIdAndUpdate(
            postID,
            { likes: post.likes + 1 },
            { new: true }
        )
        return updatedPost;
    } catch(err) {
        return err;
    }
}

const deletePost = async (postID) => {
    try {
        let removed = await Posts.deleteOne({ _id: postID });
        return removed;
    } catch (err) {
        return err;
    }
}

const updateAddInformation = async (lectureID) => {
    const lecture = await Lectures.findById(lectureID)
    let posts = [...lecture.posts];

    // add updated lecture to course
    await Courses.findOneAndUpdate(
        { "lectures._id": lectureID },
        { $set: { "lectures.$.posts": posts }}
    )
}

const updateDeleteInformation = async (postID) => {
    try {
        const lecture = await Lectures.findOneAndUpdate(
            { "posts._id": postID },
            { $pull: { posts: { _id: postID }}},
            { new: true }
        )

        await Courses.findOneAndUpdate(
            { "lectures._id": lecture._id },
            { $set: { "lectures.$.posts": lecture.posts }}
        )

        return lecture;
    } catch (err) {
        return err;
    }
}

const updateInformation = async (postID, newLikes) => {
    try {
        // add updated lecture to course
        const lecture = await Lectures.findOneAndUpdate(
            { "posts._id": postID },
            { $set: { "posts.$.likes": newLikes }}
        )

        // add updated lecture to course
        await Courses.findOneAndUpdate(
            { "lectures._id": lecture._id },
            { $set: { "lectures.$.posts": lecture.posts }}
        )

        return lecture;
    } catch(err) {
        return err;
    }
}

module.exports = { likePost, deletePost, createPost, updateInformation, updateDeleteInformation, updateAddInformation };