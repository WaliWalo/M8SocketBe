const express = require("express");
const cors = require("cors");
const { join } = require("path");
const listEndpoints = require("express-list-endpoints");
const mongoose = require("mongoose");
// const Pusher = require('pusher')

const profilesRouter = require("./services/profiles");
const experiencesRouter = require("./services/experiences");
const postsRouter = require("./services/posts");
const commentsRouter = require("./services/comments");
const chatBoxRoute = require("./services/chatbox");
const reactionsRouter = require("./services/reactions");

const {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} = require("./errorHandlers");

const server = express();

const port = process.env.PORT;

// //CHATBOX SIDESERVER
// const pusher = new Pusher({
//   appId: process.env.PUSHER_APP_ID,
//   key: process.env.PUSHER_KEY,
//   secret: process.env.PUSHER_SECRET,
//   cluster: process.env.PUSHER_CLUSTER,
//   encrypted: true
// })

server.use(express.json());

server.use(cors());

server.use("/profiles", profilesRouter);
server.use("/experiences", experiencesRouter);
server.use("/posts", postsRouter);
server.use("/comments", commentsRouter);
server.use("/chat", chatBoxRoute);
server.use("/reactions", reactionsRouter);

// ERROR HANDLERS MIDDLEWARES

server.use(badRequestHandler);
server.use(notFoundHandler);
server.use(genericErrorHandler);

console.log(listEndpoints(server));

mongoose
  .connect(process.env.MONGO_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(
    server.listen(port, () => {
      console.log("Running on port", port);
    })
  )
  .catch((err) => console.log(err));
