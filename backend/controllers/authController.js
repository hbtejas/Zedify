const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { isDBConnected } = require('../config/db');
const { memUsers } = require('../config/memStore');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const buildUserPayload = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture || '',
  bio: user.bio || '',
  college: user.college || '',
  branch: user.branch || '',
  year: user.year || '',
  skillsOffered: user.skillsOffered || [],
  skillsWanted: user.skillsWanted || [],
  followers: user.followers || [],
  following: user.following || [],
  token,
});

// @desc Register user
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, college, branch, year, skillsOffered, skillsWanted } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────
    if (isDBConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }
      const user = await User.create({
        name, email, password,
        college: college || '', branch: branch || '', year: year || '',
        skillsOffered: skillsOffered || [], skillsWanted: skillsWanted || [],
      });
      return res.status(201).json({
        success: true, message: 'Registration successful',
        data: buildUserPayload(user, generateToken(user._id)),
      });
    }

    // ── In-memory demo path ───────────────────────────────────────────────
    const existingKey = [...memUsers.keys()].find((k) => k === email.toLowerCase());
    if (existingKey) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    const id = uuidv4();
    const hashed = await bcrypt.hash(password, 10);
    const demoUser = {
      _id: id, name, email, password: hashed,
      profilePicture: '', bio: '',
      college: college || '', branch: branch || '', year: year || '',
      skillsOffered: skillsOffered || [], skillsWanted: skillsWanted || [],
      followers: [], following: [],
    };
    memUsers.set(email.toLowerCase(), demoUser);
    return res.status(201).json({
      success: true, message: 'Registration successful',
      data: buildUserPayload(demoUser, generateToken(id)),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// @desc Login user
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // ── MongoDB path ──────────────────────────────────────────────────────
    if (isDBConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      user.onlineStatus = true;
      await user.save({ validateBeforeSave: false });
      return res.json({
        success: true, message: 'Login successful',
        data: buildUserPayload(user, generateToken(user._id)),
      });
    }

    // ── In-memory demo path ───────────────────────────────────────────────
    const demoUser = memUsers.get(email.toLowerCase());
    if (!demoUser) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, demoUser.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    return res.json({
      success: true, message: 'Login successful',
      data: buildUserPayload(demoUser, generateToken(demoUser._id)),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

// @desc Get current user
// @route GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (isDBConnected()) {
      const user = await User.findById(req.user._id);
      return res.json({ success: true, data: user });
    }
    const demoUser = [...memUsers.values()].find((u) => u._id === req.user._id);
    if (!demoUser) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, data: buildUserPayload(demoUser, '') });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
