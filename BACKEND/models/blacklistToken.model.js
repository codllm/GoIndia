const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60 * 12 // ⏱ 12 hours
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model('BlacklistedToken', blacklistTokenSchema);
