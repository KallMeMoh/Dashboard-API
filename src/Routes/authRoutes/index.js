const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const { body, validationResult } = require("express-validator");
const config = require("../../config.js");

const router = express.Router();

const { User, Token } = require("../../Database/index.js");

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTokenExpiry,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpiry,
  });
};

router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 5 })
      .withMessage("Username must be at least 5 characters long"),
    body('password')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 8 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({ username, password: hashedPassword });
      await user.save();

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const tokenDoc = new Token({
        userId: user._id,
        accessToken,
        refreshToken,
      });
      await tokenDoc.save();

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error(error); // Log the error for debugging
      if (error.message === 'Invalid username or password') {
        res.status(401).json({ message: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },
);

router.post(
  "/login",
  [
    body("username").exists().withMessage("Username is required"),
    body('password')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 8 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user) throw new Error("Invalid username or password");

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) throw new Error("Invalid username or password");

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const tokenDoc = new Token({
        userId: user._id,
        accessToken,
        refreshToken,
      });
      await tokenDoc.save();

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      console.error(error); // Log the error for debugging
      if (error.message === 'Invalid username or password') {
        res.status(401).json({ message: error.message });
      } else if (error.name === 'ValidationError') {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },
);

router.post("/refresh-token", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res
      .status(401)
      .json({ message: "Missing or malformed authorization header" });

  const refreshToken = authHeader.split(" ")[1];
  
  if (!refreshToken)
    return res.status(401).json({ message: "Missing refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    const tokenDoc = await Token.findOne({
      userId: decoded.userId,
      refreshToken,
    });
    if (!tokenDoc)
      return res.status(401).json({ message: "Invalid refresh token" });

    const accessToken = generateAccessToken(decoded.userId);
    tokenDoc.accessToken = accessToken;
    await tokenDoc.save();

    res.status(200).json({ accessToken });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      await RefreshToken.deleteOne({ token: refreshToken });
      res.status(401).json({ message: "Refresh token expired" });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid refresh token" });
    } else {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
});

router.post("/logout", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res
      .status(401)
      .json({ message: "Missing or malformed authorization header" });

  const accessToken = authHeader.split(" ")[1];
  
  if (!accessToken)
    return res.status(401).json({ message: "Missing access token" });

  try {
    // Delete the token directly
    const result = await Token.deleteOne({ accessToken });

    if (result.deletedCount === 0) {
      return res.status(401).json({ message: "Invalid access token" });
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
