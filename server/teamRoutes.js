const express = require("express");
const router = express.Router();
const Team = require("./models/Team");
const auth = require("./auth");
const Player = require("./models/Player");

router.get("/my-team", auth, async (req, res) => {
  try {
    const team = await Team.findOne({ owner: req.user._id })
      .populate("players")
      .exec();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/add-player", auth, async (req, res) => {
  try {
    const { player } = req.body;

    let team = await Team.findOne({ owner: req.user._id }).populate("players");
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.budget < player.price)
      return res.status(400).json({ error: "Insufficient budget " });

    const alreadyInTeam = team.players.some((p) => p.id === player.id);
    if (alreadyInTeam)
      return res.status(400).json({ error: "Player already in team " });

    const positionCounts = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Attacker: 0,
    };

    team.players.forEach((p) => {
      positionCounts[p.position]++;
    });

    if (player.position === "Goalkeeper" && positionCounts.Goalkeeper >= 2)
      return res.status(400).json({ error: "Maximum 2 goalkeepers allowed" });
    if (player.position === "Defender" && positionCounts.Defender >= 5)
      return res.status(400).json({ error: "Maximum 5 defenders allowed" });
    if (player.position === "Midfielder" && positionCounts.Midfielder >= 5)
      return res.status(400).json({ error: "Maximum 5 midfielders allowed" });
    if (player.position === "Attacker" && positionCounts.Attacker >= 3)
      return res.status(400).json({ error: "Maximum 3 attackers allowed" });

    const playerDoc = await Player.findOneAndUpdate(
      { id: player.id },
      { $set: player },
      { upsert: true, new: true }
    );

    team = await Team.findOneAndUpdate(
      { owner: req.user._id },
      {
        $addToSet: { players: playerDoc._id },
        $inc: { budget: -player.price },
      },
      { new: true }
    ).populate("players");

    if (!team) return res.status(404).json({ error: "Team not found " });

    res.json(team);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/remove-player", auth, async (req, res) => {
  try {
    const { player } = req.body;
    const team = await Team.findOneAndUpdate(
      { owner: req.user._id },
      { $pull: { players: player._id }, $inc: { budget: +player.price } },
      { new: true }
    ).populate("players");

    if (!team) return res.status(404).json({ error: "Team not found " });

    const teamsWithPlayer = await Team.countDocuments({
      players: req.body.player._id,
    });

    if (teamsWithPlayer === 0) {
      await Player.deleteOne({ _id: req.body.player._id });
    }

    res.json(team);
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
