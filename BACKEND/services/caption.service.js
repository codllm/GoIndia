const captionModel = require("../models/caption.model");

module.exports.createcaption = async ({
  firstname,
  lastname,
  email,
  password,
  phone,
  color,
  plate,
  capacity,
  vehicleType,
}) => {
  if (!firstname || !email || !password || !phone || !plate || !color || !vehicleType || !capacity) {
    throw new Error("All fields are required");
  }

  const caption = await captionModel.create({
    fullname: { firstname, lastname },
    email,
    password,
    phone,
    vehicle: { color, plate, capacity, vehicleType },
  });

  return caption;
};