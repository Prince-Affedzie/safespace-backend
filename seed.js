import mongoose from "mongoose";
import dotenv from "dotenv";
import Resource from "./models/Resource.js";

dotenv.config();

const resources = [
  {
    title: "What is depression? A plain-language guide",
    description:
      "An accessible overview of depression — symptoms, causes, and what you can do about it.",
    url: "https://www.who.int/news-room/fact-sheets/detail/depression",
    category: "Depression",
    tags: ["depression", "symptoms", "awareness"],
  },
  {
    title: "5 evidence-based coping strategies for anxiety",
    description:
      "Practical techniques including grounding, breathing exercises, and cognitive reframing.",
    url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders",
    category: "Anxiety",
    tags: ["anxiety", "coping", "techniques"],
  },
  {
    title: "Understanding stress and how to manage it",
    description:
      "Learn what stress does to your body and mind, and practical ways to reduce it.",
    url: "https://www.who.int/news-room/fact-sheets/detail/mental-health-strengthening-our-response",
    category: "Stress",
    tags: ["stress", "management", "wellbeing"],
  },
  {
    title: "Mental Health Authority Ghana — crisis support",
    description:
      "Free 24/7 helpline: 0800 111 222. Confidential support from trained counsellors.",
    url: "https://www.mhagh.com",
    category: "Crisis",
    tags: ["crisis", "helpline", "ghana"],
  },
  {
    title: "Befrienders Ghana — emotional support",
    description:
      "Confidential emotional support for anyone in distress. Call +233 244 846 800.",
    url: "https://www.befrienders.org",
    category: "Crisis",
    tags: ["crisis", "support", "ghana"],
  },
  {
    title: "Simple daily habits for better mental wellbeing",
    description:
      "Small lifestyle changes that can significantly improve your mental health over time.",
    url: "https://www.mentalhealth.org.uk/explore-mental-health/publications/how-look-after-your-mental-health",
    category: "Wellbeing",
    tags: ["wellbeing", "habits", "self-care"],
  },
  {
    title: "How to talk to someone about your mental health",
    description:
      "Practical advice on opening up to a friend, family member, or professional.",
    url: "https://www.mind.org.uk/information-support/guides-to-support-and-services/seeking-help-for-a-mental-health-problem",
    category: "General",
    tags: ["talking", "support", "help-seeking"],
  },
];

mongoose
  .connect(process.env.MONGO_URI, { dbName: "safespace-gh" })
  .then(async () => {
    console.log("MongoDB connected");

    // Clear existing resources first
    await Resource.deleteMany({});
    console.log("Existing resources cleared");

    // Insert new resources
    await Resource.insertMany(resources);
    console.log("Resources seeded successfully");

    mongoose.connection.close();
  })
  .catch((err) => console.log("Error:", err));
