import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // The user who created the post
    // nullable because anonymous posts don't store a userId
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Whether the post is anonymous
    // If true, userId is not returned in API responses
    isAnonymous: {
      type: Boolean,
      default: false,
    },

    // Post title — max 120 characters
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    // Post content — max 2000 characters
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // Category of the post
    category: {
      type: String,
      enum: ["Depression", "Anxiety", "Stress", "Wellbeing", "General"],
      default: "General",
    },

    // Admin moderation flag
    // If true, the post is hidden from public view
    flagged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Post = mongoose.model("Post", postSchema);

export default Post;
