const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: ['post', 'user', 'message', 'video'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetTypeModel',
    },
    targetTypeModel: {
      type: String,
      required: true,
      enum: ['Post', 'User', 'Message', 'VideoSession'],
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      enum: [
        'Harassment',
        'Inappropriate Content',
        'Misinformation',
        'Impersonation',
        'Spam',
        'Other',
      ],
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolution: {
      type: String,
      default: '',
    },
    actionTaken: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', reportSchema);
