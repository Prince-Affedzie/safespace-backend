// We need mongoose to define the shape of our data
import mongoose from "mongoose";

// This defines what a user document looks like in MongoDB
const userSchema = new mongoose.Schema(
  {
    // The user's display name — required, must be a string
    name: {
      type: String,
      required: true,
      trim: true, // removes accidental spaces at start and end
    },

    // The user's email — must be unique, no two users can share one
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // always stored in lowercase
      trim: true,
    },

    // The hashed password — we never store the raw password
    passwordHash: {
      type: String,
      required: true,
    },

    // Has the user accepted the screening consent? Default is false
    consentGiven: {
      type: Boolean,
      default: false,
    },

    // When did they accept consent? Not required until they do
    consentDate: {
      type: Date,
      default: null,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields to every document
    timestamps: true,
  },
);

// Create the model from the schema and export it
// 'User' becomes the collection name 'users' in MongoDB
const User = mongoose.model("User", userSchema);

export default User;
