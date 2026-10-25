const pool = require("../config/database");

const {
  createNotification,
} = require("../services/notificationService");

// GET POSTS
const getPosts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.content,
        p.created_at,

        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.role,

        pr.headline,
        pr.profile_photo_url,

        (
          SELECT COUNT(*)
          FROM comments c
          WHERE c.post_id = p.id
        ) AS comment_count

      FROM posts p

      JOIN users u
        ON u.id = p.user_id

      LEFT JOIN profiles pr
        ON pr.user_id = u.id

      ORDER BY p.created_at DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      posts: result.rows,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load posts",
    });
  }
};


// CREATE POST
const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Post is too long",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO posts
      (user_id, content)
      VALUES ($1, $2)
      RETURNING *
      `,
      [userId, content.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Post created",
      post: result.rows[0],
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};


// ADD COMMENT
const createComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    const post = await pool.query(
      `
      SELECT id
      FROM posts
      WHERE id = $1
      `,
      [postId]
    );

    if (post.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO comments
      (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [postId, userId, content.trim()]
    );

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment: result.rows[0],
    });
  } catch (error) {
    console.error("Create comment error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};


// GET COMMENTS
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const result = await pool.query(
      `
      SELECT
        c.id,
        c.content,
        c.created_at,

        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.role,

        pr.headline

      FROM comments c

      JOIN users u
        ON u.id = c.user_id

      LEFT JOIN profiles pr
        ON pr.user_id = u.id

      WHERE c.post_id = $1

      ORDER BY c.created_at ASC
      `,
      [postId]
    );

    res.json({
      success: true,
      comments: result.rows,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load comments",
    });
  }
};


// SEND CONNECTION REQUEST
const sendConnection = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { userId: receiverId } = req.params;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot connect with yourself",
      });
    }

    const receiver = await pool.query(
      `
      SELECT id
      FROM users
      WHERE id = $1
      AND is_active = true
      `,
      [receiverId]
    );

    if (receiver.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existing = await pool.query(
      `
      SELECT id
      FROM connections
      WHERE
        (requester_id = $1 AND receiver_id = $2)
        OR
        (requester_id = $2 AND receiver_id = $1)
      `,
      [senderId, receiverId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Connection already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO connections
      (requester_id, receiver_id, status)
      VALUES ($1, $2, 'pending')
      RETURNING *
      `,
      [senderId, receiverId]
    );

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      connection: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Send connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to send connection request",
    });
  }
};


// ACCEPT CONNECTION
const acceptConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { connectionId } = req.params;

    const result = await pool.query(
      `
      UPDATE connections
      SET
        status = 'accepted',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      AND receiver_id = $2
      AND status = 'pending'
      RETURNING *
      `,
      [connectionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    res.json({
      success: true,
      message: "Connection accepted",
      connection: result.rows[0],
    });
  } catch (error) {
    console.error(
      "Accept connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to accept connection",
    });
  }
};


// GET MY CONNECTIONS
const getMyConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT
        c.id AS connection_id,
        c.status,

        u.id AS user_id,
        u.first_name,
        u.last_name,
        u.role,

        pr.headline,
        pr.profile_photo_url

      FROM connections c

      JOIN users u
        ON u.id =
          CASE
            WHEN c.requester_id = $1
              THEN c.receiver_id
            ELSE c.requester_id
          END

      LEFT JOIN profiles pr
        ON pr.user_id = u.id

      WHERE
        (
          c.requester_id = $1
          OR c.receiver_id = $1
        )
        AND c.status = 'accepted'

      ORDER BY c.updated_at DESC
      `,
      [userId]
    );

    res.json({
      success: true,
      connections: result.rows,
    });
  } catch (error) {
    console.error(
      "Get connections error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to load connections",
    });
  }
};


module.exports = {
  getPosts,
  createPost,
  createComment,
  getComments,
  sendConnection,
  acceptConnection,
  getMyConnections,
};

await createNotification({
  userId: receiverId,
  type: "connection",
  title: "New connection request",
  message:
    "Someone wants to connect with you on FELG.",
  relatedId: result.rows[0].id,
});