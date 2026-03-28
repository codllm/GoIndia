const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const captionModel = require("../models/caption.model");

//  FARE 
async function getFare(pickup, destination) {
  try {
    const pickupCoords = await mapService.getAddressCoordinates(pickup);
    const destinationCoords = await mapService.getAddressCoordinates(
      destination
    );

    const origin = `${pickupCoords.longitude},${pickupCoords.latitude}`;
    const dest = `${destinationCoords.longitude},${destinationCoords.latitude}`;

    const distanceData = await mapService.getDistance(origin, dest);

    const distanceInKm = distanceData.distanceValue / 1000;
    const durationInMin = distanceData.durationValue / 60;

    const pricing = {
      motorcycle: { baseFare: 20, perKmRate: 5, perMinRate: 1 },
      auto: { baseFare: 30, perKmRate: 8, perMinRate: 2 },
      car: { baseFare: 50, perKmRate: 12, perMinRate: 3 },
    };

    const fares = {};

    for (const type in pricing) {
      const { baseFare, perKmRate, perMinRate } = pricing[type];

      fares[type] = Math.round(
        baseFare + distanceInKm * perKmRate + durationInMin * perMinRate
      );
    }

    return fares;
  } catch (err) {
   
    throw err;
  }
}

//  OTP 
function getOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString(); 
}

//  CREATE RIDE 
async function createRide({
  pickup,
  destination,
  user,
  vehicleType,
  pickupLocation,
  destinationLocation,
}) {
  if (!user || !pickup || !destination || !vehicleType) {
    throw new Error("Missing required fields");
  }

  const fares = await getFare(pickup, destination);

  if (!fares[vehicleType]) {
    throw new Error("Invalid vehicle type");
  }

  const otp = getOtp();

  const ride = new rideModel({
    user,
    pickup,
    destination,
    vehicleType,
    fare: fares[vehicleType],
    otp,
    status: "pending",
    pickupLocation,
    destinationLocation,
  });

  return await ride.save();
}

//  NEARBY caption 
async function getNearbycaption(longitude, latitude) {
  return await captionModel.find({
    status: "active",
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        $maxDistance: 50000, 
      },
    },
  });
}

module.exports = {
  getFare,
  createRide,
  getNearbycaption,
};
