const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
require("dotenv/config");
const app = express();
const http = require("http");
const cors = require("cors");
const server = http.createServer(app);
const port = process.env.PORT || 5001;

// socket io
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origins: "*:*",
        methods: ["GET", "POST"],
        allowedHeaders: ["content-type", "application/json"],
        pingTimeout: 7000,
        pingInterval: 3000
      }
});

const userRoutes = require("./routes/userRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const postRoutes = require("./routes/postRoutes");

const { socketAPI } = require('./api/socket-api');

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

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
