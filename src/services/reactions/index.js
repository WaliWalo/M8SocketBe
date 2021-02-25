const express = require("express");
const mongoose = require("mongoose");
const PostModel = require("./schema");
const UserModel = require("../profiles/schema");
const ReactionModel = require("./schema");
const reactionsRouter = express.Router();

// - POST https://yourapi.herokuapp.com/reactions/:userId/:postId
//     Creates a new reaction
reactionsRouter.post("/:userId/:postId", async (req, res, next) => {
  try {
    //POST
    let body = {
      ...req.body,
      user: new mongoose.Types.ObjectId(req.params.userId),
      post: new mongoose.Types.ObjectId(req.params.postId),
    };
    const newReaction = new ReactionModel(body),
      { _id } = await newReaction.save();
    res.status(201).send(newReaction);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// - GET https://yourapi.herokuapp.com/reactions/:PostId
//     Retrieve reactions for a post
reactionsRouter.get("/:postId", async (req, res, next) => {
  try {
    let reactions = await ReactionModel.find({
      post: req.params.postId,
    }).populate({ path: "user", select: ["username"] });
    let reactCount = await ReactionModel.aggregate([
      {
        $match: {
          post: mongoose.Types.ObjectId(req.params.postId),
        },
      },
      { $group: { _id: "$react", count: { $sum: 1 } } },
    ]);
    let reactionsWithCount = {
      reactions: [...reactions],
      reactCounts: reactCount,
    };

    if (reactions.length === 0) {
      let error = new Error("POST NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    } else {
      res.status(201).send(reactionsWithCount);
    }
  } catch (error) {
    next(error);
  }
});

// - DELETE https://yourapi.herokuapp.com/api/reactions/{userId}/{postId}
// Removes a reaction by user id and post id
reactionsRouter.delete("/:userId/:postId", async (req, res, next) => {
  try {
    const deletePost = await ReactionModel.findOneAndRemove({
      user: mongoose.Types.ObjectId(req.params.userId),
      post: mongoose.Types.ObjectId(req.params.postId),
    });
    console.log(deletePost);
    if (deletePost) {
      res.send("DELETE BY ID");
    } else {
      const err = new Error(`Something happened`);
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = reactionsRouter;
