const mongoose = require("mongoose");

const PostsSchema = mongoose.Schema({
    author: mongoose.Schema.Types.ObjectId,
    content: String,
    likes: Number,
    type: String,
    replies: [mongoose.Schema.Types.ObjectId]
})

const Posts = mongoose.model("Posts", PostsSchema);

module.exports = { PostsSchema, Posts };
