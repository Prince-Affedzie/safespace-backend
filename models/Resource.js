import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    // Resource title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Short summary of the resource
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    // External link to the resource
    url: {
      type: String,
      required: true,
      trim: true,
    },

    // Which condition this resource covers
    category: {
      type: String,
      enum: [
        "Depression",
        "Anxiety",
        "Stress",
        "Wellbeing",
        "Crisis",
        "General",
      ],
      default: "General",
    },

    // Additional tags for filtering
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;
