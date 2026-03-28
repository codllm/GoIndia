const axios = require("axios");

const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

// get corrdinates
module.exports.getAddressCoordinates = async (address) => {
  const encoded = encodeURIComponent(address);

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`;

  const response = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN,
      limit: 1,
    },
  });

  if (!response.data.features.length) {
    throw new Error("No location found");
  }

  const coords = response.data.features[0].center;

  return {
    latitude: coords[1],
    longitude: coords[0],
  };
};

// distance
module.exports.getDistance = async (origin, destination) => {
  // origin = "lng,lat"
  // destination = "lng,lat"

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin};${destination}`;

  const response = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN,
      geometries: "geojson",
    },
  });

  if (!response.data.routes.length) {
    throw new Error("No route found");
  }

  const route = response.data.routes[0];

  return {
    distanceText: (route.distance / 1000).toFixed(2) + " km",//getting distnace in m
    distanceValue: route.distance,

    durationText: Math.round(route.duration / 60) + " min",
    durationValue: route.duration,

    geometry: route.geometry,
  };
};

// SUGGESTIONS
module.exports.getSuggestions = async (input) => {
  const encoded = encodeURIComponent(input);

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`;

  const response = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN,
      autocomplete: true,
      limit: 12,
    },
  });

  return response.data.features.map((place) => ({
    name: place.place_name,
    coordinates: place.center, // [lng, lat]
  }));
};

// REVERSE
module.exports.getAddressFromCoords = async (lat, lng) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json`;

  const response = await axios.get(url, {
    params: {
      access_token: MAPBOX_TOKEN,
    },
  });

  if (!response.data.features.length) {
    throw new Error("No address found");
  }

  return response.data.features[0].place_name;
};