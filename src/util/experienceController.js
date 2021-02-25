const { downloadResource } = require("./util");
const ExperienceModel = require("../services/experiences/schema");
const controller = {};

controller.download = async (req, res, next) => {
  try {
    const fields = [
      {
        label: "Role",
        value: "role",
      },
      {
        label: "Company",
        value: "company",
      },
      {
        label: "Start Date",
        value: "startDate",
      },
      {
        label: "End Date",
        value: "endDate",
      },
      {
        label: "Description",
        value: "description",
      },
      {
        label: "Area",
        value: "area",
      },
      {
        label: "Image",
        value: "image",
      },
      {
        label: "User Id",
        value: "user",
      },
    ];
    const data = await ExperienceModel.find({
      user: req.params.userId,
    });

    return downloadResource(res, "experiences.csv", fields, data);
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
};

module.exports = controller;
