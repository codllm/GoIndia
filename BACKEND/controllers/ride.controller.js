const rideModel = require("../models/ride.model");
const rideService = require("../services/ride.service");
const mapService = require("../services/maps.service");
const { validationResult } = require("express-validator");
const User = require("../models/user.model");

//  CREATE
module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { pickup, destination, vehicleType } = req.body;

    const pickupCoords = await mapService.getAddressCoordinates(pickup);

    const destinationCoords = await mapService.getAddressCoordinates(
      destination
    );

    const ride = await rideService.createRide({
      pickup,
      destination,
      user: req.user._id,
      vehicleType,
      pickupLocation: pickupCoords,
      destinationLocation: destinationCoords,
    });

    const nearbycaptions = await rideService.getNearbycaption(
      pickupCoords.longitude,
      pickupCoords.latitude
    );

    const io = req.app.get("io");

    nearbycaptions.forEach((caption) => {
      if (caption.socketId) {
        io.to(caption.socketId).emit("rideCreated", {
          ride,
          user: {
            fullname: req.user.fullname,
            phone: req.user.phone,
          },
        });
      }
    });

    res.status(201).json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  ACCEPT
module.exports.acceptRide = async (req, res) => {
  try {
    const { rideID } = req.body;

    if (!rideID) return res.status(400).json({ message: "rideID is required" });

    const ride = await rideModel
      .findOneAndUpdate(
        { _id: rideID, status: "pending" },
        {
          caption: req.caption._id,
          status: "accepted",
        },
        { new: true }
      )
      .populate("user")
      .populate("caption");

      if(!ride){
        return res.status(400).json({ 
          message: "Ride already accepted by another captain." 
      });
      }

    const user = await User.findById(ride.user._id);
    const io = req.app.get("io");
    

    if (user?.socketId) {
      io.to(user.socketId).emit("ride-accepted", {
        rideId: ride._id,
        status: ride.status,
        caption: ride.caption,
        otp: ride.otp,
      });
    }

    io.to(req.caption.socketId).emit("ride-accepted-success", {
      message: "Ride accepted successfully",
      rideId: ride._id,
    });

    res.status(200).json({ message: "Ride accepted", ride });
  } catch (err) {
    console.error("acceptRide error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

//  START
module.exports.startRide = async (req, res) => {
  const { rideId, otp } = req.body;

  try {
    const ride = await rideModel
      .findById(rideId)
      .select("+otp")
      .populate("user");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.caption.toString() !== req.caption._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (ride.status !== "accepted") {
      return res.status(400).json({ message: "Ride not ready" });
    }

    if (ride.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    ride.status = "ongoing";
    await ride.save();

    const io = req.app.get("io");

    // Emit to both user and captain
    io.to(ride.user.socketId).emit("ride-started", {
      rideId: ride._id,
      status: "ongoing",
    });

    res.status(200).json({ message: "Ride started", ride });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//  CANCEL
module.exports.cancelRide = async (req, res) => {
  const { rideId } = req.body;

  try {
    const ride = await rideModel.findById(rideId);

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    if (ride.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    ride.status = "cancelled";
    await ride.save();

    res.status(200).json({ message: "Ride cancelled" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  GET FARE
module.exports.getfare = async (req, res) => {
  const { pickup, destination } = req.query;

  try {
    const fare = await rideService.getFare(pickup, destination);
    res.status(200).json({ fare });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  DETAILS
module.exports.getRideDetailsById = async (req, res) => {
  const { rideId } = req.query;

  try {
    const ride = await rideModel
      .findById(rideId)
      .select("+otp")
      .populate("caption")
      .populate("user", "fullname phone");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    res.status(200).json(ride);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

//  END RIDE
module.exports.endRide = async (req, res) => {
  const { rideId, paymentMethod } = req.body;

  try {
    const ride = await rideModel
      .findByIdAndUpdate(
        rideId,
        { status: "completed", payment: paymentMethod },
        { new: true }
      )
      .populate("user");

    if (!ride) return res.status(404).json({ message: "Ride not found" });

    const io = req.app.get("io");

    // Fix: emit to both user and captain separately
    io.to(ride.user.socketId).emit("ride-ended", {
      rideId: ride._id,
      status: "completed",
      paymentMethod,
    });

    io.to(req.caption.socketId).emit("ride-ended", {
      rideId: ride._id,
      status: "completed",
      paymentMethod,
    });

    return res.status(200).json({ message: "Ride completed", ride });
  } catch (err) {
    return res.status(500).json({ message: "Error ending ride" });
  }
};
