const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const { authcaption } = require("../middleware/auth.middleware");
const captionController = require("../controllers/caption.controller");

// REGISTER
router.post(
  "/register",
  [
    body("firstname").trim().isLength({ min: 3 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").trim().isLength({ min: 10, max: 10 }),
    body("vehicle.color").isLength({ min: 3 }),
    body("vehicle.plate").isLength({ min: 3 }),
    body("vehicle.capacity").isInt({ min: 1 }),
    body("vehicle.vehicleType").isIn(["car", "auto", "motorcycle"]),
  ],
  captionController.registercaption
);

// LOGIN
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  captionController.logincaption
);

// PROFILE
router.get("/profile", authcaption, captionController.profilecaption);

// LOCATION UPDATE
router.post(
  "/update-location",
  authcaption,
  [
    body("latitude").isFloat({ min: -90, max: 90 }),
    body("longitude").isFloat({ min: -180, max: 180 }),
  ],
  captionController.updateLocation
);

// LOGOUT
router.get("/logout", authcaption, captionController.logoutcaption);

module.exports = router;