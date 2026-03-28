const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const captionSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: 3,
    },
    lastname: {
      type: String,
      minlength: 3,
    },
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  phone: {
    type: String,
    required: true,
  },

  socketId: {
    type: String,
    default: null,
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },

  vehicle: {
    color: { type: String, required: true, minlength: 3 },
    plate: { type: String, required: true, minlength: 3 },
    capacity: { type: Number, required: true, min: 1 },
    vehicleType: {
      type: String,
      required: true,
      enum: ["car", "auto", "motorcycle"],
    },
  },

  location: {
    type: { type: String, enum: ["Point"] },
    coordinates: [Number],
  },
});

captionSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "12h",
  });
};

captionSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("caption", captionSchema);