import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    // Which post this comment belongs to
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    // Who wrote the comment
    // nullable for anonymous comments
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Whether the comment is anonymous
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // Comment text — max 500 characters
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
