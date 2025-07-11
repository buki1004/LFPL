const express = require("express");
const router = express.Router();
const Team = require("./models/Team");
const auth = require("./auth");
const Player = require("./models/Player");

router.get("/my-team", auth, async (req, res) => {
  try {
    const team = await Team.findOne({ owner: req.user._id })
      .populate("players.player")
      .exec();
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/add-player", auth, async (req, res) => {
  try {
    const { player } = req.body;

    let team = await Team.findOne({ owner: req.user._id }).populate(
      "players.player"
    );
    if (!team) return res.status(404).json({ error: "Team not found" });

    if (team.budget < player.price)
      return res.status(400).json({ error: "Insufficient budget " });

    const alreadyInTeam = team.players.some(
      (p) => p.player && p.player.id === player.id
    );
    if (alreadyInTeam)
      return res.status(400).json({ error: "Player already in team " });

    const positionCounts = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Attacker: 0,
    };

    team.players.forEach((p) => {
      if (p.player && p.player.position) positionCounts[p.player.position]++;
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
        $push: {
          players: {
            player: playerDoc._id,
            isSubstitute: true,
            isCaptain: false,
          },
        },
        $inc: { budget: -player.price },
      },
      { new: true }
    ).populate("players.player");

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
      {
        $pull: { players: { player: player._id } },
        $inc: { budget: +player.price },
      },
      { new: true }
    ).populate("players.player");

    if (!team) return res.status(404).json({ error: "Team not found " });

    const teamsWithPlayer = await Team.countDocuments({
      "players.player": player._id,
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

router.post("/make-captain", auth, async (req, res) => {
  try {
    const { playerId } = req.body;

    await Team.updateOne(
      { owner: req.user._id },
      { $set: { "players.$[].isCaptain": false } }
    );

    await Team.updateOne(
      { owner: req.user._id, "players.player": playerId },
      { $set: { "players.$.isCaptain": true } }
    );

    const updatedTeam = await Team.findOne({ owner: req.user._id }).populate(
      "players.player"
    );

    res.json(updatedTeam);
  } catch (error) {
    console.error("Error when making player captain: ", error);
    res.status(500).json({ error: "Failed to update captain" });
  }
});

router.post("/substitute", auth, async (req, res) => {
  try {
    const { playerId } = req.body;

    const team = await Team.findOne({ owner: req.user._id }).populate(
      "players.player"
    );

    const playerSubdoc = team.players.find((p) =>
      p.player._id.equals(playerId)
    );
    if (!playerSubdoc)
      return res.status(404).json({ error: "Player not found" });

    if (playerSubdoc.isSubstitute) {
      const positionLimits = {
        Goalkeeper: 1,
        Defender: 5,
        Midfielder: 5,
        Attacker: 3,
      };

      const positionMinimums = {
        Goalkeeper: 1,
        Defender: 3,
        Midfielder: 3,
        Attacker: 1,
      };

      const totalMax = 11;

      const playerPosition = playerSubdoc.player.position;

      const currentStarters = team.players.filter(
        (p) => p.player.position === playerPosition && !p.isSubstitute
      ).length;

      const currentPlayers = team.players.filter((p) => !p.isSubstitute).length;

      if (currentStarters >= positionLimits[playerPosition]) {
        return res.status(400).json({
          error: `Maximum ${positionLimits[playerPosition]} ${playerPosition}(s) already in starting team`,
        });
      }
      if (currentPlayers >= totalMax) {
        return res.status(400).json({
          error: "There are already 11 players in the starting 11!",
        });
      }
    }

    playerSubdoc.isSubstitute = !playerSubdoc.isSubstitute;

    await team.save();

    const updatedTeam = await Team.findOne({ owner: req.user._id }).populate(
      "players.player"
    );
    res.json(updatedTeam);
  } catch (error) {
    console.error("Error in substituting player: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
