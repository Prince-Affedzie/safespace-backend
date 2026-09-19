import express from "express";
import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ════════════════════════════════════════════════════════
// GET /api/posts
// Fetch all posts — newest first
// Public — no token required
// ════════════════════════════════════════════════════════
router.get("/", async (req, res) => {
  try {
    // Find all posts that are not flagged
    // sort newest first
    const posts = await Post.find({ flagged: false }).sort({ createdAt: -1 });

    // For anonymous posts, remove the userId before sending
    const sanitised = posts.map((post) => {
      const p = post.toObject();
      if (p.isAnonymous) p.userId = null;
      return p;
    });

    res.status(200).json(sanitised);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════════
// GET /api/posts/:id
// Fetch a single post with its comments
// Public — no token required
// ════════════════════════════════════════════════════════
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post || post.flagged) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Fetch all comments for this post
    const comments = await Comment.find({ postId: req.params.id }).sort({
      createdAt: 1,
    }); // oldest first for comments

    // Sanitise anonymous data
    const postObj = post.toObject();
    if (postObj.isAnonymous) postObj.userId = null;

    const sanitisedComments = comments.map((comment) => {
      const c = comment.toObject();
      if (c.isAnonymous) c.userId = null;
      return c;
    });

    res.status(200).json({ post: postObj, comments: sanitisedComments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/posts
// Create a new post
// Protected — token required
// ════════════════════════════════════════════════════════
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, body, category, isAnonymous } = req.body;

    // Validate required fields
    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required" });
    }

    // If anonymous, don't store the userId
    const post = await Post.create({
      userId: isAnonymous ? null : req.user.userId,
      isAnonymous: isAnonymous || false,
      title,
      body,
      category: category || "General",
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════════
// POST /api/posts/:id/comments
// Add a comment to a post
// Protected — token required
// ════════════════════════════════════════════════════════
router.post("/:id/comments", authMiddleware, async (req, res) => {
  try {
    const { body, isAnonymous } = req.body;

    if (!body) {
      return res.status(400).json({ message: "Comment body is required" });
    }

    // Check the post exists
    const post = await Post.findById(req.params.id);
    if (!post || post.flagged) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = await Comment.create({
      postId: req.params.id,
      userId: isAnonymous ? null : req.user.userId,
      isAnonymous: isAnonymous || false,
      body,
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ════════════════════════════════════════════════════════
// DELETE /api/posts/:id
// Delete a post — only the owner can delete their post
// Protected — token required
// ════════════════════════════════════════════════════════
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check the logged-in user is the owner of the post
    if (post.userId?.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Not authorised to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Also delete all comments on this post
    await Comment.deleteMany({ postId: req.params.id });

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
