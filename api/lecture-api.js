const { Lectures } = require("../models/Lectures");
const { deletePost } = require("./post-api");

const deleteLecture = async (lectureID) => {
    try {
        const lecture = await Lectures.findById(lectureID);
        for (let i = 0; i < lecture.posts.length; ++i) {
            const postID = lecture.posts[i]._id;
            await deletePost(postID);
        }
        let removed = await Lectures.deleteOne({ _id: lectureID });
        return removed;
    } catch (err) {
        return err;
    }
}

module.exports = { deleteLecture };
