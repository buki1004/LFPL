const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const fixtureEventsPath = path.join(__dirname, "fixtureEvents.json");

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "allFixtures.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading fixtures:", err);
      return res.status(500).json({ error: "Failed to load fixtures" });
    }

    try {
      const fixtures = JSON.parse(data);
      res.json(fixtures);
    } catch (parseErr) {
      console.error("Error parsing fixtures JSON:", parseErr);
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

router.get("/:id", (req, res) => {
  const fixtureId = req.params.id;
  fs.readFile(fixtureEventsPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading fixture events:", err);
      return res.status(500).json({ error: "Failed to load fixture events" });
    }

    try {
      const events = JSON.parse(data);
      const fixtureData = events[fixtureId];

      if (!fixtureData) {
        return res
          .status(404)
          .json({ error: "No detailed data for this fixture" });
      }

      res.json(fixtureData);
    } catch (parseErr) {
      console.error("Error parsing events JSON:", parseErr);
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

module.exports = router;
