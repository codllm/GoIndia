const mapService = require("../services/maps.service");

// corrdinates
module.exports.getCoordinates = async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({
      error: "Address is required",
    });
  }

  try {
    const coords = await mapService.getAddressCoordinates(address);
    res.status(200).json(coords);

  } catch (err) {
    
    res.status(500).json({ error: "Failed to fetch coordinates" });
  }
};

// distance
module.exports.getDistance = async (req, res) => {
  const { origin, destination } = req.query;

  if (!origin || !destination) {
    return res.status(400).json({
      error: "Origin & destination required",
    });
  }

  try {
    const data = await mapService.getDistance(origin, destination);
    res.status(200).json(data);

  } catch (err) {
   
    res.status(500).json({ error: "Failed to fetch distance" });
  }
};

//  SUGGESTIONS 
module.exports.getSuggestions = async (req, res) => {
  const { input } = req.query;

  if (!input) {
    return res.status(400).json({
      error: "Input required",
    });
  }

  try {
    const suggestions = await mapService.getSuggestions(input);
    res.status(200).json(suggestions);

  } catch (err) {
   
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};

//  REVERSE GEOCODE 
module.exports.getAddressFromCoords = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      error: "lat & lng required",
    });
  }

  try {
    const address = await mapService.getAddressFromCoords(lat, lng);

    res.status(200).json({ address });

  } catch (err) {
   
    res.status(500).json({
      error: "Failed to fetch address",
    });
  }
};