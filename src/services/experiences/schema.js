const { Schema, model } = require("mongoose");
// EXPERIENCE Model:
//     {
//         "_id": "5d925e677360c41e0046d1f5",  //server generated
//         "role": "CTO",
//         "company": "Strive School",
//         "startDate": "2019-06-16T22:00:00.000Z",
//         "endDate": "2019-06-16T22:00:00.000Z", //could be null
//         "description": "Doing stuff here and there",
//         "area": "Berlin",
//         "username": "admin",
//         "createdAt": "2019-09-30T19:58:31.019Z",  //server generated
//         "updatedAt": "2019-09-30T19:58:31.019Z",  //server generated
//         "image": ... //server generated on upload, set a default here
//     }
const ExperienceSchema = new Schema(
  {
    role: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    description: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    user: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  {
    timestamps: true,
  }
);

const ExperienceModel = model("Experience", ExperienceSchema);
module.exports = ExperienceModel;
