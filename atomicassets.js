const ATOMIC_ENDPOINTS = process.env.ATOMIC_ENDPOINTS.split(",");

// randomize selection
const ATOMIC_ENDPOINT =
  ATOMIC_ENDPOINTS[Math.floor(Math.random() * ATOMIC_ENDPOINTS.length)] +
  "/atomicassets/v1";

module.exports = {
  ATOMIC_ENDPOINT,
};
