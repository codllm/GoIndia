const mongoose = require("mongoose");

function connectToDb() {
  console.log("👉 connecting to mongo...");
  console.log("👉 URI:", process.env.MONGO_URI);

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ connected to mongoose"))
    .catch(err => {
      console.error("❌ db connection failed:", err.message);
      process.exit(1);
    });
}

module.exports = connectToDb;
