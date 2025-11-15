require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./authRoutes");
const teamRoutes = require("./teamRoutes");
const pointsTest = require("./pointsTest");
const leagueRoutes = require("./leagueRoutes");
const fixtureRoutes = require("./fixtureRoutes");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Player = require("./models/Player");
const { json } = require("stream/consumers");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

require("./models/User");
require("./models/Player");
require("./models/Team");
require("./models/League");

app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/league", leagueRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api", pointsTest);

function randomPrice(min, max) {
  const randomInt =
    Math.floor(Math.random() * (max * 10 - min * 10 + 1)) + min * 10;
  return randomInt / 10;
}

function setPlayerPrices1(players) {
  return players.map((player) => {
    if (!player.player.price) {
      if (player.statistics[0].games.position === "Goalkeeper") {
        const price = player.statistics[0].goals.saves * 0.02 + 4;
        player.player.price = Math.round(price * 10) / 10;
      } else if (player.statistics[0].games.position === "Defender") {
        const price = player.statistics[0].tackles.interceptions * 0.05 + 4;
        player.player.price = Math.round(price * 10) / 10;
      } else if (player.statistics[0].games.position === "Midfielder") {
        const price =
          player.statistics[0].goals.total * 0.1 +
          player.statistics[0].goals.assists * 0.05 +
          player.statistics[0].passes.key * 0.02 +
          4;
        player.player.price = Math.round(price * 10) / 10;
      } else if (player.statistics[0].games.position === "Attacker") {
        const price =
          player.statistics[0].goals.total * 0.2 +
          player.statistics[0].goals.assists * 0.1 +
          4;
        player.player.price = Math.round(price * 10) / 10;
      }
      return player;
    }
    return player;
  });
}

console.log("Server started!!!!");
app.get("/api/players", async (req, res) => {
  const { name, position } = req.query;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * 20;

  try {
    const filter = {};
    if (name) {
      const regex = new RegExp(name, "i");
      filter.$or = [{ name: regex }, { teamName: regex }];
    }

    if (position && position !== "All Positions") {
      filter.position = position;
    }

    const totalPlayers = await Player.countDocuments(filter);

    const players = await Player.find(filter)
      .sort({ price: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      players,
      totalPlayers,
      currentPage: page,
      totalPages: Math.ceil(totalPlayers / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching players " });
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});
