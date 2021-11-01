const express = require("express");
const app = express();

app.get("/", (req, res) => {
  return res.send("API for Shomaii");
});

module.exports = app;
