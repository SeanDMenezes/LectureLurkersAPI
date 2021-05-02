const mongoose = require("mongoose");

const UsersSchema = mongoose.Schema({
    username: String,
    password: String,
    role: String,
});

const Users = mongoose.model("Users", UsersSchema);

module.exports = { UsersSchema, Users };
