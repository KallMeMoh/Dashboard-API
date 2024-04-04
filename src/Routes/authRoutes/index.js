const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ms = require("ms");
const { body, validationResult } = require("express-validator");
const config = require("../../config.js");

const router = express.Router();

const { User, RefreshToken } = require("../../Database/index.js");

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
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
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

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      res.status(400).send({ error: "err" });
    }
  },
);

router.post(
  "/login",
  [
    body("username").exists().withMessage("Username is required"),
    body("password").exists().withMessage("Password is required"),
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
      const refreshTokenString = generateRefreshToken(user._id);

      const refreshToken = new RefreshToken({
        userId: user._id,
        token: refreshTokenString,
        expiry: Date.now() + ms(config.jwt.refreshTokenExpiry),
      });
      await refreshToken.save();

      res.status(200).json({ accessToken, refreshToken });
    } catch (error) {
      res.status(400).send(error.message);
    }
  },
);

router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Missing refresh token" });

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  )
    return res
      .status(401)
      .json({ message: "Missing or malformed authorization header" });

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    const refreshTokenDoc = await RefreshToken.findOne({
      userId: decoded.userId,
    });
    if (!refreshTokenDoc)
      return res.status(401).json({ message: "Invalid refresh token" });

    if (refreshTokenDoc.expiry < Date.now()) {
      await refreshTokenDoc.deleteOne();
      return res.status(401).json({ message: "Refresh token expired" });
    }

    if (refreshToken !== refreshTokenDoc.token)
      return res.status(401).json({ message: "Invalid refresh token" });

    const newAccessToken = generateAccessToken(decoded.userId);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Missing refresh token" });

  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  )
    return res
      .status(401)
      .json({ message: "Missing or malformed authorization header" });

  const token = req.headers.authorization.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret);

    const refreshTokenDoc = await RefreshToken.findOne({
      userId: decoded.userId,
    });
    if (!refreshTokenDoc)
      return res.status(401).json({ message: "Invalid refresh token" });

    if (refreshTokenDoc.expiry < Date.now()) {
      await refreshTokenDoc.deleteOne();
      return res.status(401).json({ message: "Refresh token expired" });
    }

    if (refreshToken !== refreshTokenDoc.token)
      return res.status(401).json({ message: "Invalid refresh token" });

    await refreshTokenDoc.deleteOne();
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
