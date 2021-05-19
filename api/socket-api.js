
const { likePost, deletePost, createPost, updateInformation, updateDeleteInformation, updateAddInformation } = require('./../api/post-api');

const socketAPI = (io) => {
    io.on("connection", (socket) => {
        console.log("a user connected", socket.id);
    
        socket.on("postAdd", async (lectureID, userID, content) => {
            try {
                let res = await createPost(lectureID, userID, content);
                io.emit("postAdded", res);
                await updateAddInformation(lectureID);
            } catch (err) {
                console.log(err);
            }
        });
    
        socket.on("like", async (postID) => {
            try {
                let res = await likePost(postID);
                io.emit("liked", res);
                await updateInformation(postID, res.likes);
            } catch (err) {
                console.log(err);
            }
        })
    
        socket.on("remove", async (postID) => {
            try {
                let res = await deletePost(postID);
                io.emit("removed", res, postID);
                await updateDeleteInformation(postID);
            } catch (err) {
                console.log(err);
            }
        })
    
        socket.on("disconnect", () => {
            console.log("a user disconnected", socket.id);
        })
    })
}

module.exports = {socketAPI}