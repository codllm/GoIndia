const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const auth = require("../middleware/auth.middleware");
const userController = require("../controllers/user.controller");

// REGISTER
router.post(
  "/register",
  [
    body("firstname").trim().isLength({ min: 3 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("phone").trim().isLength({ min: 10, max: 10 }),
  ],
  userController.registerUser
);

// LOGIN
router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  userController.loginUser
);

// PROFILE
router.get("/profile", auth.authUser, userController.getUserProfile);

// LOGOUT
router.get("/logout", auth.authUser, userController.logoutUser);

module.exports = router;