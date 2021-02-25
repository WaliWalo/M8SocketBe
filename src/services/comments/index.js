const express = require("express");
const mongoose = require("mongoose");
const commentModel = require("./schema");
const ProfileModel = require("../profiles/schema");
const PostModel = require("../posts/schema");
const commentsRouter = express.Router();
const experienceController = require("../../util/experienceController");
// - POST https://yourapi.herokuapp.com/api/comments/:userName/:postId
// Create a comment
commentsRouter.post("/:userId/:postId", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId);
    if (post) {
      const newComment = {
        ...req.body,
        post: new mongoose.Types.ObjectId(req.params.postId),
        user: new mongoose.Types.ObjectId(req.params.userId),
      };
      const newCommentModel = new commentModel(newComment);
      const result = await newCommentModel.save();
      res.status(201).send(result);
    } else {
      let error = new Error("POST NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// - GET https://yourapi.herokuapp.com/api/comments/:postId
// Get comments
commentsRouter.get("/:postId", async (req, res, next) => {
  try {
    const comments = await commentModel
      .find({
        post: req.params.postId,
      })
      .populate({ path: "post", select: "text" })
      .populate({ path: "user", select: ["name", "image"] });
    if (comments) {
      res.status(201).send(comments);
    } else {
      let error = new Error("POST NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// - GET https://yourapi.herokuapp.com/api/comments/:postId
// Get comments
commentsRouter.get("/:postId/:userId/:commentId", async (req, res, next) => {
  try {
    const comment = await commentModel
      .findById({
        post: [...req.params.postId, req.params.userId],
      })
      .populate({ path: "post", select: "text" })
      .populate({ path: "user", select: ["name", "image"] });
    if (comments) {
      res.status(201).send(comments);
    } else {
      let error = new Error("POST NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// - PUT https://yourapi.herokuapp.com/api/comments/:commentId
// Get and update specific comment
commentsRouter.put("/:commentId", async (req, res, next) => {
  try {
    const comment = await commentModel.findByIdAndUpdate(
      req.params.commentId,
      req.body,
      { new: true, useFindAndModify: false }
    );
    if (comment) {
      res.status(201).send(comment);
    } else {
      let error = new Error("POST NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    const err = new Error();
    if (error.name == "CastError") {
      err.message = "User Not Found";
      err.httpStatusCode = 404;
      next(err);
    } else {
      next(error);
    }
  }
});

// - DELETE https://yourapi.herokuapp.com/api/comments/:commentId
//     Get a specific experience
commentsRouter.delete("/:commentId", async (req, res, next) => {
  try {
    const comment = await commentModel.findByIdAndRemove(req.params.commentId);
    if (comment) {
      res.status(201).send(`${comment._id} REMOVED`);
    } else {
      let error = new Error("COMMENT NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

const multer = require("multer");
const cloudinary = require("../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "Strive Products",
  },
});

const cloudinaryMulter = multer({ storage: storage });

// - POST https://yourapi.herokuapp.com/api/experiences/userName/experiences/:expId/picture
//     Change the experience picture
commentsRouter.post(
  "/:commentId/picture/upload",
  cloudinaryMulter.single("image"),
  async (req, res, next) => {
    try {
      const comment = await commentModel.find({
        _id: req.params.commentId,
      });
      if (comment) {
        const updateComment = await commentModel.findByIdAndUpdate(
          req.params.commentId,
          { $set: { image: req.file.path } },
          { new: true, useFindAndModify: false }
        );
        res.status(201).send(updateComment);
      } else {
        let error = new Error("COMMENT NOT FOUND");
        error.httpStatusCode = 404;
        next(error);
      }
    } catch (error) {
      const err = new Error();
      if (error.name == "CastError") {
        err.message = "COMMENT Not Found";
        err.httpStatusCode = 404;
        next(err);
      } else {
        next(error);
      }
    }
  }
);

module.exports = commentsRouter;
