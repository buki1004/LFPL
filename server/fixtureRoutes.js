const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

router.get("/", (req, res) => {
  const filePath = path.join(__dirname, "allFixtures.json"); // safer than process.cwd()

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

module.exports = router;
