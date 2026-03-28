const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const blacklistTokenModel = require("../models/blacklistToken.model");
const Ride = require("../models/ride.model");

// REGISTER 
module.exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstname, lastname, email, password, phone } = req.body;

  const existing = await userModel.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Email already registered" });
  }

  try {
    const user = await userService.createUser({
      firstname,
      lastname,
      email,
      password,
      phone,
    });

    const token = user.generateAuthToken();

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        firstname: user.fullname.firstname,
        lastname: user.fullname.lastname,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
   
    return res.status(500).json({ message: "Registration failed" });
  }
};

// LOGIN
module.exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  const token = user.generateAuthToken();

  return res.status(200).json({
    token,
    user: {
      _id: user._id,
      firstname: user.fullname.firstname,
      lastname: user.fullname.lastname,
      email: user.email,
      phone: user.phone,
    },
  });
};

// PROFILE
module.exports.getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    const rides = await Ride.find({ user: user._id })
      .sort({ createdAt: -1 })
      .select("pickup destination fare status paymentMethod createdAt");

    return res.status(200).json({
      user: {
        _id: user._id,
        firstname: user.fullname.firstname,
        lastname: user.fullname.lastname,
        email: user.email,
        phone: user.phone,
      },
      rides,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// LOGOUT
module.exports.logoutUser = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) await blacklistTokenModel.create({ token });
  return res.status(200).json({ message: "Logged out" });
};