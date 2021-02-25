const express = require("express");
const mongoose = require("mongoose");
const ExperienceModel = require("./schema");
const ProfileModel = require("../profiles/schema");
const experienceRouter = express.Router();
const { ExportToCsv } = require("export-to-csv");
const { pipeline } = require("stream");
const experienceController = require("../../util/experienceController");
// - POST https://yourapi.herokuapp.com/api/experiences/:userName/
// Create an experience.
experienceRouter.post("/:userId", async (req, res, next) => {
  try {
    const user = await ProfileModel.findById(req.params.userId);
    if (user) {
      const newExperience = {
        ...req.body,
        user: new mongoose.Types.ObjectId(req.params.userId),
      };
      const newExperienceModel = new ExperienceModel(newExperience);
      const result = await newExperienceModel.save();
      res.status(201).send(result);
    } else {
      let error = new Error("USER NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// - GET https://yourapi.herokuapp.com/api/experiences/userName/experiences
// Get user experiences
experienceRouter.get("/:userId", async (req, res, next) => {
  try {
    const experiences = await ExperienceModel.find({
      user: req.params.userId,
    });
    if (experiences) {
      res.status(201).send(experiences);
    } else {
      let error = new Error("USER NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

// - GET https://yourapi.herokuapp.com/api/experiences/userName/experiences/:expId
// Get a specific experience
experienceRouter.get("/:userId/:expId", async (req, res, next) => {
  try {
    const user = await ProfileModel.findById(req.params.userId);
    if (user) {
      const experience = await ExperienceModel.find({
        _id: req.params.expId,
      }).populate("user");
      if (experience) {
        res.status(201).send(experience);
      } else {
        let error = new Error("EXPERIENCE NOT FOUND");
        error.httpStatusCode = 404;
        next(error);
      }
    } else {
      let error = new Error("USER NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
  } catch (error) {
    const err = new Error();
    if (error.name == "CastError") {
      err.message = "USER Not Found";
      err.httpStatusCode = 404;
      next(err);
    } else {
      next(error);
    }
  }
});

// - PUT https://yourapi.herokuapp.com/api/experiences/userName/experiences/:expId
// Get and update specific experience
experienceRouter.put("/:userId/:expId", async (req, res, next) => {
  try {
    const user = await ProfileModel.findById(req.params.userId);
    if (user) {
      const experience = await ExperienceModel.findByIdAndUpdate(
        req.params.expId,
        req.body,
        { new: true, useFindAndModify: false }
      );
      if (experience) {
        res.status(201).send(experience);
      } else {
        let error = new Error("EXPERIENCE NOT FOUND");
        error.httpStatusCode = 404;
        next(error);
      }
    } else {
      let error = new Error("USER NOT FOUND");
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

// - DELETE https://yourapi.herokuapp.com/api/experiences/userName/experiences/:expId
//     Get a specific experience
experienceRouter.delete("/:userId/:expId", async (req, res, next) => {
  try {
    const user = await ProfileModel.findById(req.params.userId);
    if (user) {
      const experience = await ExperienceModel.findByIdAndRemove(
        req.params.expId
      );
      if (experience) {
        res.status(201).send(`${experience._id} REMOVED`);
      } else {
        let error = new Error("EXPERIENCE NOT FOUND");
        error.httpStatusCode = 404;
        next(error);
      }
    } else {
      let error = new Error("USER NOT FOUND");
      error.httpStatusCode = 404;
      next(error);
    }
    res.status(201).send("DELETE BY ID");
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
experienceRouter.post(
  "/:userId/:expId/picture",
  cloudinaryMulter.single("image"),
  async (req, res, next) => {
    try {
      const user = await ProfileModel.findById(req.params.userId);
      if (user) {
        const experience = await ExperienceModel.find({
          _id: req.params.expId,
        });
        if (experience) {
          const updateExperience = await ExperienceModel.findByIdAndUpdate(
            req.params.expId,
            { $set: { image: req.file.path } },
            { new: true, useFindAndModify: false }
          );
          res.status(201).send(updateExperience);
        } else {
          let error = new Error("EXPERIENCE NOT FOUND");
          error.httpStatusCode = 404;
          next(error);
        }
      } else {
        let error = new Error("USER NOT FOUND");
        error.httpStatusCode = 404;
        next(error);
      }
    } catch (error) {
      const err = new Error();
      if (error.name == "CastError") {
        err.message = "Experience Not Found";
        err.httpStatusCode = 404;
        next(err);
      } else {
        next(error);
      }
    }
  }
);

// - GET https://yourapi.herokuapp.com/api/experiences/userName/experiences/CSV
// Download the experiences as a CSV
experienceRouter.get("/:userId/experiences/csv", experienceController.download);

module.exports = experienceRouter;
