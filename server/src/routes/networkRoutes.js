const express = require("express");

const {
  getPosts,
  createPost,
  createComment,
  getComments,
  sendConnection,
  acceptConnection,
  getMyConnections,
} = require("../controllers/networkController");

const {
  authenticate,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Posts
router.get(
  "/posts",
  authenticate,
  getPosts
);

router.post(
  "/posts",
  authenticate,
  createPost
);

// Comments
router.get(
  "/posts/:postId/comments",
  authenticate,
  getComments
);

router.post(
  "/posts/:postId/comments",
  authenticate,
  createComment
);

// Connections
router.post(
  "/connections/:userId",
  authenticate,
  sendConnection
);

router.patch(
  "/connections/:connectionId/accept",
  authenticate,
  acceptConnection
);

router.get(
  "/connections",
  authenticate,
  getMyConnections
);

module.exports = router;