const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const cookiePaerse = require("cookie-parser");
const app = express();

const userRoutes = require("./routes/user.routes");

const captionRoutes = require("./routes/caption.routes");

const mapsRoutes = require("./routes/maps.routes");

const rideRoutes = require("./routes/ride.routes");

app.use(cookiePaerse());

// middleware
app.use(
  cors({
    origin: "http://localhost:5173", // frontend ka exact URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// test route
app.get("/", (req, res) => {
  res.send("hello nishant");
});

// routes
app.use("/users", userRoutes);
app.use("/captions", captionRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);

// db connect
// connectToDb();

module.exports = app;
