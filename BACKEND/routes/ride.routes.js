const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { body } = require("express-validator");

const rideController = require("../controllers/ride.controller");

// CREATE
router.post(
  "/create",
  auth.authUser,
  [
    body("pickup").notEmpty(),
    body("destination").notEmpty(),
    body("vehicleType").notEmpty(),
  ],
  rideController.createRide
);

// ACCEPT
router.post("/accept", auth.authcaption, rideController.acceptRide);

// START
router.post("/start", auth.authcaption, rideController.startRide);

// CANCEL
router.post("/cancel", auth.authUser, rideController.cancelRide);

// FARE
router.get("/get-fare", auth.authUser, rideController.getfare);

// DETAILS
router.get("/details", auth.authUser, rideController.getRideDetailsById);
router.get('/caption/details-by-id', auth.authcaption, rideController.getRideDetailsById);

router.post("/end", (req, res, next) => {

  next();
}, auth.authcaption, rideController.endRide);

module.exports = router;
