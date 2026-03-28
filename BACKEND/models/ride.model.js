const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    caption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "caption",
    },
    payment:{
      type:String,
      default:"cash"
    },

    pickup: String,
    destination: String,

    fare: Number,

    status: {
      type: String,
      enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
      default: "pending",
    },

    otp: {
      type: String,
      select: false,
    },

    pickupLocation: {
      latitude: Number,
      longitude: Number,
    },

    destinationLocation: {
      latitude: Number,
      longitude: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ride", rideSchema);
