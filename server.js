const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
require("dotenv/config");
const app = express();
const http = require("http");
const server = http.createServer(app);
const port = process.env.PORT_NUMBER || 5000;

// socket io
const { Server } = require("socket.io");
const io = new Server(server);

const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const postRoutes = require("./routes/postRoutes");

const { socketAPI } = require('./api/socket-api');

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => res.send("Backend up..."));
app.use("/api/lurkers", userRoutes);
app.use("/api/lurkers", courseRoutes);
app.use("/api/lurkers", lectureRoutes);
app.use("/api/lurkers", postRoutes);

// connect to db
mongoose.connect(
    process.env.DB_CONNECTION, 
    { useNewUrlParser: true, useUnifiedTopology: true }
).then(res => console.log("connected to db")).catch(err => console.log(err));

socketAPI(io);

server.listen(port, () => console.log(`Listening on port ${port}`));
