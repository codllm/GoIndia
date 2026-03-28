const { validationResult } = require("express-validator");
const captionModel = require("../models/caption.model");
const captionService = require("../services/caption.service");
const blacklistTokenModel = require("../models/blacklistToken.model");
const Ride = require("../models/ride.model");
const bcrypt = require("bcrypt");

// REGISTER 
module.exports.registercaption = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, email, password, phone, vehicle } = req.body;

  const existing = await captionModel.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const caption = await captionService.createcaption({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      phone,
      color: vehicle.color,
      plate: vehicle.plate,
      capacity: vehicle.capacity,
      vehicleType: vehicle.vehicleType,
    });

    const token = caption.generateAuthToken();

    return res.status(201).json({
      token,
      caption,
    });
  } catch (err) {
   
    return res.status(500).json({ message: "Registration failed" });
  }
};

//LOGIN
module.exports.logincaption = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const caption = await captionModel.findOne({ email }).select("+password");
  if (!caption) {
    return res.status(404).json({ message: "Captain not found" });
  }

  const isMatch = await bcrypt.compare(password, caption.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = caption.generateAuthToken();

  return res.status(200).json({ token, caption });
};

// PROFILE
module.exports.profilecaption = async (req, res) => {
  try {
    const caption = req.caption;
    if (!caption) return res.status(401).json({ message: "Unauthorized" });

    const rides = await Ride.find({ caption: caption._id })
      .populate("user", "fullname phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      caption: {
        _id: caption._id,
        firstname: caption.fullname.firstname,
        lastname: caption.fullname.lastname,
        email: caption.email,
        phone: caption.phone,
        status: caption.status,
        vehicle: {
          plate: caption.vehicle?.plate,
          color: caption.vehicle?.color,
          type: caption.vehicle?.vehicleType,
          capacity: caption.vehicle?.capacity,
        },
      },
      rides,
    });
  } catch (err) {
   
    return res.status(500).json({ message: "Error fetching profile" });
  }
};

// UPDATE LOCATION
module.exports.updateLocation = async (req, res) => {
  const { latitude, longitude } = req.body;

  await captionModel.findByIdAndUpdate(req.caption._id, {
    status: "active",
    location: {
      type: "Point",
      coordinates: [longitude, latitude],
    },
  });

  return res.status(200).json({ message: "Location updated" });
};

//  LOGOUT
module.exports.logoutcaption = async (req, res) => {
  const token =
    req.cookies.captionToken || req.headers.authorization?.split(" ")[1];

  if (token) await blacklistTokenModel.create({ token });

  res.clearCookie("captionToken");
  return res.status(200).json({ message: "Logout successful" });
};