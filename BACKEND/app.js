const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Fixed the typo from 'cookiePaerse'
const app = express();

const userRoutes = require("./routes/user.routes");
const captionRoutes = require("./routes/caption.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");

// 1. Database Connection (Ensure this is uncommented if not called in server.js)
// const connectToDb = require('./db/db'); 
// connectToDb();

// 2. Middleware setup
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Dynamic CORS Configuration
app.use(
  cors({
    // This allows your local machine AND your future Vercel URL to work
    origin: [
      "http://localhost:5173", 
      process.env.FRONTEND_URL // We will add this variable to Render
    ],
    credentials: true,
  })
);

// 4. Test route
app.get("/", (req, res) => {
  res.send("hello nishant - Backend is Live!");
});

// 5. Routes
app.use("/users", userRoutes);
app.use("/captions", captionRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);

module.exports = app;