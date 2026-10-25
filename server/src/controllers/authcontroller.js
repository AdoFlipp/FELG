const bcrypt = require("bcrypt");
const pool = require("../config/database");
const generateToken = require("../utils/generateToken");

const register = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      country,
      city,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }

    const allowedRoles = [
      "student",
      "graduate",
      "employer",
      "university",
      "college",
      "startup",
      "mentor",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid FELG account role",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    if (
  typeof password !== "string" ||
  password.length < 8
) {
  return res.status(400).json({
    success: false,
    message:
      "Password must be at least 8 characters long",
  });
}

const weakPasswords = new Set([
  "password",
  "password123",
  "12345678",
  "123456789",
  "qwerty123",
]);

if (
  weakPasswords.has(
    password.toLowerCase()
  )
) {
  return res.status(400).json({
    success: false,
    message:
      "Please choose a stronger password",
  });
}

if (weakPasswords.has(password.toLowerCase())) {
  return res.status(400).json({
    success: false,
    message: "Please choose a stronger password",
  });
}

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users
      (email, password_hash, role, first_name, last_name, country, city)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role, first_name, last_name, country, city`,
      [
        email.toLowerCase(),
        passwordHash,
        role,
        firstName,
        lastName,
        country || null,
        city || null,
      ]
    );

    const user = result.rows[0];

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "FELG account created successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT id, email, password_hash, role,
              first_name, last_name, country, city,
              is_verified, is_active
       FROM users
       WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "This account has been disabled",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    delete user.password_hash;

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

module.exports = {
  register,
  login,
};