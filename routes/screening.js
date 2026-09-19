import express from "express";
import ScreeningSession from "../models/ScreeningSession.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ════════════════════════════════════════════════════════
// SCORING FUNCTIONS
// ════════════════════════════════════════════════════════

function scorePHQ9(responses) {
  const score = responses.reduce((sum, val) => sum + val, 0);
  let severityLevel;
  let crisisReferral = false;
  if (score <= 4) severityLevel = "Minimal";
  else if (score <= 9) severityLevel = "Mild";
  else if (score <= 14) severityLevel = "Moderate";
  else if (score <= 19) severityLevel = "Moderately Severe";
  else {
    severityLevel = "Severe";
    crisisReferral = true;
  }
  return { score, severityLevel, crisisReferral };
}

function scoreGAD7(responses) {
  const score = responses.reduce((sum, val) => sum + val, 0);
  let severityLevel;
  let crisisReferral = false;
  if (score <= 4) severityLevel = "Minimal";
  else if (score <= 9) severityLevel = "Mild";
  else if (score <= 14) severityLevel = "Moderate";
  else {
    severityLevel = "Severe";
    crisisReferral = true;
  }
  return { score, severityLevel, crisisReferral };
}

function scorePSS10(responses) {
  const positiveItems = [3, 4, 6, 7];
  const score = responses.reduce((sum, val, index) => {
    if (positiveItems.includes(index)) return sum + (4 - val);
    return sum + val;
  }, 0);
  let severityLevel;
  let crisisReferral = false;
  if (score <= 13) severityLevel = "Low";
  else if (score <= 26) severityLevel = "Moderate";
  else {
    severityLevel = "High";
    crisisReferral = true;
  }
  return { score, severityLevel, crisisReferral };
}

function scoreWHO5(responses) {
  const rawScore = responses.reduce((sum, val) => sum + val, 0);
  const score = rawScore * 4;
  let severityLevel;
  let crisisReferral = false;
  if (score >= 50) severityLevel = "Good Wellbeing";
  else if (score >= 28) severityLevel = "Poor Wellbeing";
  else {
    severityLevel = "Very Poor Wellbeing";
    crisisReferral = true;
  }
  return { score, severityLevel, crisisReferral };
}

// ════════════════════════════════════════════════════════
// INTERPRETATION TEXTS
// ════════════════════════════════════════════════════════

function getInterpretation(questionnaireType, severityLevel) {
  const interpretations = {
    "PHQ-9": {
      Minimal:
        "Your responses suggest minimal or no symptoms of depression. Keep maintaining healthy habits and reach out if things change.",
      Mild: "Your responses suggest mild symptoms of depression. Consider speaking to someone you trust and monitoring how you feel over the coming weeks.",
      Moderate:
        "Your responses suggest moderate symptoms of depression. We encourage you to speak with a counsellor or healthcare professional.",
      "Moderately Severe":
        "Your responses suggest moderately severe symptoms of depression. Please consider reaching out to a mental health professional soon.",
      Severe:
        "Your responses suggest severe symptoms of depression. Please reach out for professional support as soon as possible.",
    },
    "GAD-7": {
      Minimal:
        "Your responses suggest minimal anxiety. This is a healthy range — continue to monitor your wellbeing.",
      Mild: "Your responses suggest mild anxiety. Simple relaxation techniques and talking to someone you trust may help.",
      Moderate:
        "Your responses suggest moderate anxiety. Speaking with a counsellor or healthcare professional is recommended.",
      Severe:
        "Your responses suggest severe anxiety. Please reach out to a mental health professional as soon as possible.",
    },
    "PSS-10": {
      Low: "Your responses suggest low perceived stress. You appear to be managing life's demands well.",
      Moderate:
        "Your responses suggest moderate stress levels. Consider stress management techniques such as exercise, rest, and talking to someone.",
      High: "Your responses suggest high levels of perceived stress. We strongly encourage you to seek support from a counsellor or trusted person.",
    },
    "WHO-5": {
      "Good Wellbeing":
        "Your responses suggest good overall wellbeing. Keep taking care of yourself.",
      "Poor Wellbeing":
        "Your responses suggest your wellbeing may be suffering. Consider speaking to someone you trust or a counsellor.",
      "Very Poor Wellbeing":
        "Your responses suggest very poor wellbeing, which may indicate depression. Please reach out for support.",
    },
  };
  return interpretations[questionnaireType][severityLevel];
}

// ════════════════════════════════════════════════════════
// POST /api/screening
// ════════════════════════════════════════════════════════

router.post("/", authMiddleware, async (req, res) => {
  try {
    const { questionnaireType, responses } = req.body;
    if (!questionnaireType || !responses || !Array.isArray(responses)) {
      return res
        .status(400)
        .json({ message: "Questionnaire type and responses are required" });
    }
    const expectedCounts = { "PHQ-9": 9, "GAD-7": 7, "PSS-10": 10, "WHO-5": 5 };
    if (responses.length !== expectedCounts[questionnaireType]) {
      return res.status(400).json({
        message: `${questionnaireType} requires exactly ${expectedCounts[questionnaireType]} responses`,
      });
    }
    let result;
    if (questionnaireType === "PHQ-9") result = scorePHQ9(responses);
    else if (questionnaireType === "GAD-7") result = scoreGAD7(responses);
    else if (questionnaireType === "PSS-10") result = scorePSS10(responses);
    else if (questionnaireType === "WHO-5") result = scoreWHO5(responses);
    else return res.status(400).json({ message: "Invalid questionnaire type" });

    const { score, severityLevel, crisisReferral } = result;
    const interpretation = getInterpretation(questionnaireType, severityLevel);

    const session = await ScreeningSession.create({
      userId: req.user.userId,
      questionnaireType,
      responses,
      score,
      severityLevel,
      crisisReferral,
    });

    res.status(201).json({
      sessionId: session._id,
      questionnaireType,
      score,
      severityLevel,
      interpretation,
      crisisReferral,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/screening/history
// ════════════════════════════════════════════════════════

router.get("/history", authMiddleware, async (req, res) => {
  try {
    const sessions = await ScreeningSession.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/screening/history
// Deletes all screening sessions for the logged-in user
// ════════════════════════════════════════════════════════

router.delete("/history", authMiddleware, async (req, res) => {
  try {
    await ScreeningSession.deleteMany({ userId: req.user.userId });
    res.status(200).json({ message: "History cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
