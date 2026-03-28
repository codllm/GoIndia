require("dotenv").config();

const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const connectToDb = require("./db/db");
const caption = require("./models/caption.model");

// DATABASE 
connectToDb();

// Use process.env.PORT so Render can assign its own port
const PORT = process.env.PORT || 3060;

const server = http.createServer(app);

// SOCKET.IO 
const io = new Server(server, {
  cors: {
    // CRITICAL: Allow your Vercel URL and Localhost for Socket.io
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL // Make sure this is set in Render settings!
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`New connection: ${socket.id}`);

  // REGISTER captain (save socketId in DB)
  socket.on("register-captain", async (captionId) => {
    try {
      if (!captionId) return;
      await caption.findByIdAndUpdate(
        captionId,
        { socketId: socket.id },
        { new: true }
      );
    } catch (err) {
      console.error("register-captain error:", err.message);
    }
  });

  // user ride create
  socket.on("join-ride", (rideId) => {
    // Leave other rooms before joining new ride room
    socket.rooms.forEach((room) => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });
    socket.join(rideId);
  });

  // caption LIVE LOCATION UPDATE
  socket.on("caption-location-update", (data) => {
    io.to(data.rideId).emit("caption-location", {
      latitude: data.latitude,
      longitude: data.longitude,
    });
  });

  // otp verification event
  socket.on("otp-verified", (data) => {
    const { rideId } = data;
    if (!rideId) return;
    io.to(rideId).emit("otp-verified-success", rideId);
  });

  // register socket for user
  socket.on("register-user", async (userId) => {
    try {
      const User = require("./models/user.model");
      if (!userId) return;
      await User.findByIdAndUpdate(
        userId,
        { socketId: socket.id },
        { new: true }
      );
    } catch (err) {
      console.error("register-user error:", err.message);
    }
  });

  // HANDLE DISCONNECT
  socket.on("disconnect", async () => {
    try {
      await caption.findOneAndUpdate(
        { socketId: socket.id },
        { socketId: null, status: "inactive" }
      );
    } catch (err) {
      // Log error if needed
    }
  });
});

// START SERVER 
server.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});