const Report = require('../models/Report');
const Post = require('../models/Post');
const User = require('../models/User');
const { isDBConnected } = require('../config/db');

// @desc Create a new report (India IT Rules 2021 Compliance)
// @route POST /api/reports/create
const createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason, description } = req.body;

    if (!targetId || !targetType || !reason) {
      return res.status(400).json({ success: false, message: 'Missing report target details' });
    }

    if (!isDBConnected()) {
      return res.status(201).json({ success: true, message: 'Report noted for review (Demo Mode)' });
    }

    const report = await Report.create({
      reporterId: req.user._id,
      targetId,
      targetType,
      targetTypeModel: targetType.charAt(0).toUpperCase() + targetType.slice(1),
      reason,
      description: description || '',
    });

    res.status(201).json({ success: true, message: 'Report submitted for review', data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Get reports for user (Transparency compliance)
// @route GET /api/reports/my
const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ reporterId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc Admin resolve report (Internal use)
const resolveReport = async (req, res) => {
  try {
    const { reportId, resolution } = req.body;
    const report = await Report.findByIdAndUpdate(reportId, { 
      status: 'resolved', 
      resolution, 
      actionTaken: true 
    }, { new: true });
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createReport, getMyReports, resolveReport };
