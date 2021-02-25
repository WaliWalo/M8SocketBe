const { Schema, model } = require("mongoose");
// EXPERIENCE Model:
//     {
//         "_id": "5d925e677360c41e0046d1f5",  //server generated
//         "text": "CTO",
//         "user": "Strive School",
//         "createdAt": "2019-09-30T19:58:31.019Z",  //server generated
//         "updatedAt": "2019-09-30T19:58:31.019Z",  //server generated
//         "image": ... //server generated on upload, set a default here
//     }
const CommentSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    user: { type: Schema.Types.ObjectId, ref: "Profile" },
    post: { type: Schema.Types.ObjectId, ref: "Posts" },
  },
  {
    timestamps: true,
  }
);

const CommentModel = model("Comment", CommentSchema);
module.exports = CommentModel;
