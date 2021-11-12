const express = require("express");
const { ATOMIC_ENDPOINT } = require("./atomicassets");

const app = express();

app.get("/", (req, res) => {
  return res.send({
    message: "API Data for Shomaii Blends",
  });
});

app.get("/collections/:collection", async (req, res) => {
  const { collection } = req.params;

  res.send(ATOMIC_ENDPOINT);
});

// run this only in dev environment
if (process.env.NODE_ENV === "development") {
  app.listen(8000, () => {
    console.log("Listening on http://localhost:8000");
  });
}

module.exports = app;
