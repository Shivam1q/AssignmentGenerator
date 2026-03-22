const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_vedaai_2026', {
    expiresIn: '7d',
  });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  res.status(statusCode).cookie('vedaai_token', token, cookieOptions).json({
    success: true,
    data: {
      token,
      user: {
        _id: user._id, // Standardize on _id for frontend compatibility
        username: user.username,
        name: user.name,
        schoolName: user.schoolName,
        city: user.city,
        avatar: user.avatar
      }
    }
  });
};

// ─── POST /api/auth/signup ───────────────────────────────────────────────────
router.post('/signup', async (req, res, next) => {
  try {
    const { username, name, schoolName, city, password, avatar } = req.body;

    if (!username || !name || !schoolName || !city || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const uncapitalizedUsername = username.toLowerCase();
    const existingUser = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username is already taken. Please choose another.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      name,
      schoolName,
      city,
      password: hashedPassword,
      avatar: avatar || 'avatar1'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    const user = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res, next) => {
  try {
    return res.json({
      success: true,
      data: { user: req.user }
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /api/auth/logout ───────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  res.cookie('vedaai_token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, message: 'User logged out.' });
});

module.exports = router;
