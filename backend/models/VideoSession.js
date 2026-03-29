const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const videoSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    skillName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['waiting', 'live', 'ended'],
      default: 'waiting',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    waitingList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VideoSession', videoSessionSchema);
