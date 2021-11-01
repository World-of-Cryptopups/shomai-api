import express from "express";
const app = express();

app.get("/", (req, res) => {
  return res.send("API for Shomaii");
});

export default app;
