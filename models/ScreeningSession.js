import mongoose from "mongoose";

const screeningSessionSchema = new mongoose.Schema(
  {
    // Which user took this screening — references the users collection
    // Like a foreign key in SQL — links this document to a user document
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which questionnaire was taken
    // enum means only these four values are allowed — nothing else
    questionnaireType: {
      type: String,
      enum: ["PHQ-9", "GAD-7", "PSS-10", "WHO-5"],
      required: true,
    },

    // Array of the user's answers — one number per question
    // PHQ-9 has 9 answers, GAD-7 has 7, PSS-10 has 10, WHO-5 has 5
    responses: {
      type: [Number],
      required: true,
    },

    // The total computed score
    score: {
      type: Number,
      required: true,
    },

    // The severity level based on the score
    severityLevel: {
      type: String,
      enum: [
        "Minimal",
        "Mild",
        "Moderate",
        "Moderately Severe",
        "High",
        "Low",
        "Good Wellbeing",
        "Poor Wellbeing",
        "Very Poor Wellbeing",
        "Severe",
      ],
      required: true,
    },

    // Whether the score triggered the crisis referral threshold
    // true means show the crisis helpline message on the results page
    crisisReferral: {
      type: Boolean,
      default: false,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields
    timestamps: true,
  },
);

const ScreeningSession = mongoose.model(
  "ScreeningSession",
  screeningSessionSchema,
);

export default ScreeningSession;
