const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ms = require('ms');
const { body, validationResult } = require('express-validator');
const config = require('../../config.js');

const router = express.Router();

const { User, Token } = require('../../Database/schema.js');

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
  '/register',
  [
    body('username')
      .isLength({ min: 5 })
      .withMessage('Username must be at least 5 characters long'),
    body('password')
      .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number, and be at least 8 characters long')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

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
    } catch (err) {
      console.error(err);
      if (err.message === 'Invalid username or password') {
        res.status(401).json({ message: err.message });
      } else if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },
);

router.post(
  '/login',
  [
    body('username').exists().withMessage('Username is required'),
    body('password')
      .matches(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
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

      if (!user) {
        return res.status(401).json({ message: 'User does not exist' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);

      const tokenDoc = new Token({
        userId: user._id,
        accessToken,
        refreshToken,
      });
      await tokenDoc.save();

      res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
      console.error(err);
      if (err.name === 'ValidationError') {
        res.status(400).json({ message: err.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  },
);

router.post('/refresh-token', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res
      .status(401)
      .json({ message: 'Missing or malformed authorization header' });

  const refreshToken = authHeader.split(' ')[1];
  
  if (!refreshToken)
    return res.status(401).json({ message: 'Missing refresh token' });

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    const tokenDoc = await Token.findOne({
      userId: decoded.userId,
      refreshToken,
    });
    if (!tokenDoc)
      return res.status(401).json({ message: 'Invalid refresh token' });

    const accessToken = generateAccessToken(decoded.userId);
    const refreshToken = generateRefreshToken(decoded.userId);
    tokenDoc.accessToken = accessToken;
    tokenDoc.refreshToken = refreshToken;
    await tokenDoc.save();

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      await Token.deleteOne({ refreshToken });
      res.status(401).json({ message: 'Refresh token expired' });
    } else if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid refresh token' });
    } else {
      console.error(err);
      res.status(500).json({ message: 'Internal Server error' });
    }
  }
});

router.post('/logout', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res
      .status(401)
      .json({ message: 'Missing or malformed authorization header' });

  const accessToken = authHeader.split(' ')[1];
  
  if (!accessToken)
    return res.status(401).json({ message: 'Missing access token' });

  try {
    // Delete the token directly
    const result = await Token.deleteOne({ accessToken });

    if (result.deletedCount === 0) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
