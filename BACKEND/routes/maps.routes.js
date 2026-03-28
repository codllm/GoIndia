const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const mapController = require("../controllers/map.controller");

// Address → Coordinates
router.get("/coordinates", auth.authUser, mapController.getCoordinates);

// Distance + Time
router.get("/distance", auth.authUser, mapController.getDistance);

// Suggestions (Autocomplete)
router.get("/get-suggestions", auth.authUser, mapController.getSuggestions);

// Reverse Geocoding
router.get("/get-address", auth.authUser, mapController.getAddressFromCoords);

module.exports = router;