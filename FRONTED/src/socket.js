import { io } from "socket.io-client";

const socket = io("http://localhost:3060", {
  transports: ["websocket"], // 🔥 important
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("🟢 SOCKET CONNECTED:", socket.id);
});

socket.on("disconnect", () => {
  console.log("🔴 SOCKET DISCONNECTED");
});

export default socket;