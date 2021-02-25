const express = require("express");
const mongoose = require("mongoose");
const UserModel = require("./schema");
const profilesRouter = express.Router();
const pdf = require("../../util/pdfController");
const multer = require("multer");
const cloudinary = require("../cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "User Images",
  },
});

const cloudinaryMulter = multer({ storage: storage });

// - POST https://yourapi.herokuapp.com/api/profile/
// Create the user profile with all his details
profilesRouter.post("/", async (req, res, next) => {
  try {
    let profile = {
      ...req.body,
      _id: new mongoose.Types.ObjectId(req.body._id),
    };
    const newProfile = new UserModel(profile);
    console.log(newProfile);
    const { _id } = await newProfile.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

// - GET https://yourapi.herokuapp.com/api/profile/
//     Retrieves list of profiles
profilesRouter.get("/", async (req, res, next) => {
  try {
    const allUsers = await UserModel.find();

    res.status(201).send(allUsers);
  } catch (error) {
    next(error);
  }
});

// #EXTRA: Find a way to return also the user with the posts, in order to have the Name / Picture to show it correcly on the frontend
// - GET https://yourapi.herokuapp.com/api/profile/{userId}
//     Retrieves the profile with userId = {userId}
profilesRouter.get("/:profileId", async (req, res, next) => {
  try {
    const selectedProfile = await UserModel.findById(req.params.profileId);
    console.log(selectedProfile);
    if (selectedProfile) {
      res.status(201).send(selectedProfile);
    } else {
      const err = new Error();
      err.message = "Profile Not Found";
      err.httpStatusCode = 404;
      next(err);
    }
  } catch (error) {
    const err = new Error();
    if (error.name == "CastError") {
      err.message = "Profile Not Found";
      err.httpStatusCode = 404;
      next(err);
    } else {
      next(error);
    }
  }
});

// - PUT https://yourapi.herokuapp.com/api/profile/
//     Update current user profile details
profilesRouter.put("/:profileId", async (req, res, next) => {
  try {
    const selectedProfile = await UserModel.findByIdAndUpdate(
      req.params.profileId,
      req.body,
      { runValidators: true, new: true }
    );

    if (selectedProfile) {
      res.status(201).send(selectedProfile);
    } else {
      res.send("This profile doesn't exists");
    }
  } catch (error) {
    const err = new Error();
    if (error.name == "CastError") {
      err.message = "Product Not Found";
      err.httpStatusCode = 404;
      next(err);
    } else {
      next(error);
    }
  }
});

// - POST https://yourapi.herokuapp.com/api/profile/{userId}/picture
// Replace user profile picture (name = profile)
profilesRouter.post(
  "/:profileId/picture/",
  cloudinaryMulter.single("image"),
  async (req, res, next) => {
    try {
      //*FINDBYID the profile through ID
      const profile = await UserModel.findById(req.params.profileId);

      //*IF exists
      if (profile) {
        //*FIND the profile and update
        //it finds a document with the same SCHEMA and the same ID and UPDATE
        const updateProfile = await UserModel.findByIdAndUpdate(
          req.params.profileId,
          { $set: { image: req.file.path } },
          { new: true, useFindAndModify: false }
        );
        //*SEND the profile updated
        res.status(201).send(updateProfile);
      } else {
        let error = new Error("EXPERIENCE NOT FOUND");
        error.httpStatusCode = 404;
        next(error);
      }
      res.status(201).send(selectedImage);
    } catch (error) {
      const err = new Error();
      if (error.name == "CastError") {
        err.message = "Product Not Found";
        err.httpStatusCode = 404;
        next(err);
      } else {
        next(error);
      }
    }
  }
);

profilesRouter.get("/cv/:id", async (req, res, next) => {
  try {
    //
    const profile = await UserModel.findById(req.params.id);
    if (profile) {
      const cv = pdf.generateCV(profile);
      res.attachment(`${profile.name}-cv.pdf`);
      cv.pipe(res);
      cv.end();
    } else {
      res.status(404).send({ message: "This person is not in db!" });
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// - GET https://yourapi.herokuapp.com/api/profile/{userId}/CV
// Generates and download a PDF with the CV of the user (details, picture, experiences)
// profilesRouter.get("/:profileId/cv", pdfController.download);

profilesRouter.delete("/:profileId", async (req, res, next) => {
  try {
    const selectedProfile = await UserModel.findByIdAndDelete(
      req.params.profileId
    );

    if (selectedProfile) {
      res.send("Profile deleted!");
    } else {
      res.send("Profile not found");
    }

    res.status(201).send("DELETE BY ID");
  } catch (error) {
    next(error);
  }
});

module.exports = profilesRouter;
