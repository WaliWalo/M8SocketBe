const { Schema, model } = require("mongoose");
// POST Model:
// {
//   {
//   _id: 1,
//   user: 2,
//   post: 2,
//   react: 2,
//   }
// }
const ReactionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Profile",
      unique: false,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Posts",
      unique: false,
    },
    react: { type: Number, min: 1, max: 6, required: true },
  },
  {
    timestamps: false,
  }
);

ReactionSchema.index({ user: 1, post: 1 }, { unique: true });

const ReactionModel = model("Reaction", ReactionSchema);
module.exports = ReactionModel;
