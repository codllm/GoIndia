const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

const blacklistTokenModel = require("../models/blacklistToken.model");
const captionModel = require("../models/caption.model");

module.exports.authUser = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token });

    if (isBlacklisted) {
      res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports.authcaption = async (req, res, next) => {

  console.log("HEADERS:", req.headers.authorization);
console.log("COOKIE TOKEN:", req.cookies.token);
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ errors: "Unauthorized" });
  }

  const isBlacklisted = await blacklistTokenModel.findOne({ token });

  if (isBlacklisted) {
    return res.status(401).json({ errors: "Unauthorized" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const caption = await captionModel.findById(decode._id);

    if (!caption) {
      return res.status(401).json({ errors: "Unauthorized" });
    }

    req.caption = caption;
    next();
  } catch (err) {
    return res.status(401).json({ errors: "Unauthorized" });
  }
};
