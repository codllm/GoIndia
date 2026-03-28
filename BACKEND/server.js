require("dotenv").config();

const http = require("http");
const app = require("./app");
const { Server } = require("socket.io");
const connectToDb = require("./db/db");
const caption = require("./models/caption.model");


//  DATABASE 
connectToDb();

const PORT = process.env.PORT || 3060;

const server = http.createServer(app);

//  SOCKET.IO 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {


  // REGISTER caption (save socketId in DB)

  socket.on("register-captain", async (captionId) => {


    const updated = await caption.findByIdAndUpdate(
      captionId,
      { socketId: socket.id },
      { new: true }
    );

  });



  // user ride create-->rideID generated and when ride accepted by caption then
  //ride room emited to user and caption and both join the room with rideID
  socket.on("join-ride", (rideId) => {

    for(let room of socket.rooms){
      if(room !== socket.id){
        socket.leave(room);
      }
    }
    socket.join(rideId);
  });

  // caption LIVE LOCATION UPDATE(event) update it via after CERTAIN SECOND
  socket.on("caption-location-update", (data) => {
 
  
    io.to(data.rideId).emit("caption-location", {
      latitude: data.latitude,
      longitude: data.longitude,
    });
  });

  //otp verification event
  socket.on("otp-verified", (data) => {
    const { rideId } = data;

    if (!rideId) return;

    io.to(rideId).emit("otp-verified-success", rideId);
  });

  //register socket for user
 socket.on("register-user", async (userId) => {
  try {
    const User = require("./models/user.model");
    
    console.log("📱 register-user called with userId:", userId);
    
    if (!userId) {
      console.log("register-user: userId is undefined/null");
      return;
    }

    const updated = await User.findByIdAndUpdate(
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
      
    }
  });
});

//  START SERVER 
server.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
