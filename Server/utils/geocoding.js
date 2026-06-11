/**
 * geocoding.js — Shared Mapbox reverse-geocoding utility
 *
 * Returns { cityName, country } from lat/lon coordinates.
 * Prioritizes city-level (place/locality) results over region/state.
 */

const axios = require("axios");
require("dotenv").config();

// List of Indian state names to detect and avoid as city names
const INDIAN_STATES = new Set([
  "andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa",
  "gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala",
  "madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland",
  "odisha","orissa","punjab","rajasthan","sikkim","tamil nadu","tamilnadu",
  "telangana","tripura","uttar pradesh","uttarakhand","west bengal",
  "delhi","jammu and kashmir","ladakh","chandigarh","puducherry",
  "pondicherry","andaman and nicobar","dadra and nagar haveli","daman and diu",
  "lakshadweep"
]);

/**
 * Returns true if the given name looks like a state/region rather than a city.
 */
const isStateName = (name) => {
  if (!name) return false;
  return INDIAN_STATES.has(name.toLowerCase().trim());
};

/**
 * Reverse-geocode (lat, lon) → { cityName, country }
 * 
 * Strategies (in order):
 *  1. Look for a feature of type "place" (city-level)
 *  2. Look for a feature of type "locality"
 *  3. Walk the context of the first feature looking for place/locality items
 *  4. Use first feature text if it's not a region/country type
 * 
 * If every strategy returns a state name, returns "Unknown" so callers
 * know they should display coordinates instead of a misleading name.
 */
const getCityFromCoordinates = async (latitude, longitude) => {
  const UNKNOWN = { cityName: "Unknown", country: "Unknown" };
  if (!latitude || !longitude) return UNKNOWN;

  try {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json`,
      {
        params: {
          access_token: process.env.MAPBOX_ACCESS_TOKEN || "pk.eyJ1Ijoib21hd2NoYXIwNyIsImEiOiJjbHlmbGtwdmowMHhkMmtxeXAyNXdkeHB3In0.37j_dk9NgxtiPXqwCgsdQg",
        },
        timeout: 5000,
      }
    );

    const features = response.data?.features;
    if (!features || features.length === 0) return UNKNOWN;

    // Helper: extract country from a feature's context array
    const extractCountry = (feature) => {
      if (!feature.context) return "Unknown";
      for (const item of feature.context) {
        if (item.id?.startsWith("country.")) return item.text;
      }
      return "Unknown";
    };

    let cityName = null;
    let country = "Unknown";

    // Strategy 1: explicit "place" type (city)
    for (const f of features) {
      if (f.place_type?.includes("place") && f.text) {
        cityName = f.text;
        country = extractCountry(f);
        break;
      }
    }

    // Strategy 2: explicit "locality" type
    if (!cityName) {
      for (const f of features) {
        if (f.place_type?.includes("locality") && f.text) {
          cityName = f.text;
          country = extractCountry(f);
          break;
        }
      }
    }

    // Strategy 3: walk context of first feature for place/locality
    if (!cityName && features[0]?.context) {
      for (const item of features[0].context) {
        if (item.id?.startsWith("place.") || item.id?.startsWith("locality.")) {
          if (item.text) {
            cityName = item.text;
            // also pick up country while walking context
          }
        }
        if (item.id?.startsWith("country.") && item.text) {
          country = item.text;
        }
      }
    }

    // Strategy 4: use first feature text if it's NOT a region/country type
    if (!cityName && features[0]?.text) {
      const types = features[0].place_type || [];
      if (!types.includes("region") && !types.includes("country")) {
        cityName = features[0].text;
        country = extractCountry(features[0]);
      }
    }

    // If cityName resolved to a state name, treat as Unknown so callers can
    // handle it (e.g. show "Near [region]" or just coordinates).
    if (isStateName(cityName)) {
      cityName = null;
    }

    // Cleanup: if name looks like a hyper-local neighbourhood, pull parent city
    if (
      cityName &&
      (cityName.includes("Nagar") ||
        cityName.includes("Colony") ||
        cityName.includes("Area"))
    ) {
      if (features[0]?.context) {
        for (const item of features[0].context) {
          if (item.id?.startsWith("place.") && item.text) {
            cityName = item.text;
            break;
          }
        }
      }
    }

    return {
      cityName: cityName || "Unknown",
      country: country || "Unknown",
    };
  } catch (err) {
    console.error("getCityFromCoordinates error:", err.message);
    return UNKNOWN;
  }
};

module.exports = { getCityFromCoordinates, isStateName };
