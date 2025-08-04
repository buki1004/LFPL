const express = require("express");
const router = express.Router();
const auth = require("./auth");
const League = require("./models/League");
const User = require("./models/User");
const Team = require("./models/Team");
const { nanoid } = require("nanoid");

router.post("/create", auth, async (req, res) => {
  try {
    const { name } = req.body;

    const team = await Team.findOne({ owner: req.user._id });
    if (!team) return res.status(404).json({ error: "Team not found." });

    const code = nanoid(8);

    const league = new League({
      name,
      code,
      createdBy: req.user._id,
      members: [
        {
          user: req.user._id,
          team: team._id,
        },
      ],
    });

    await league.save();

    res.status(201).json({
      message: "League created successfully",
      leagueId: league._id,
      inviteLink: `/join/${code}`,
    });
  } catch (error) {
    console.error("Error creating league:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.post("/join", auth, async (req, res) => {
  try {
    const { code } = req.body;

    const league = await League.findOne({ code });
    if (!league) return res.status(404).json({ error: "League not found" });

    const alreadyJoined = league.members.some((m) =>
      m.user.equals(req.user._id)
    );
    if (alreadyJoined)
      return res.status(404).json({ error: "Already in this league" });

    const team = await Team.findOne({ owner: req.user._id });
    if (!team) return res.status(404).json({ error: "Team not found" });

    league.members.push({ user: req.user._id, team: team._id });
    await league.save();

    res
      .status(200)
      .json({ message: "Joined league successfully", leagueId: league._id });
  } catch (error) {
    console.error("Error joining league:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

router.get("/my-leagues", auth, async (req, res) => {
  try {
    const leagues = await League.find({
      "members.user": req.user._id,
    })
      .populate("createdBy", "username")
      .populate("members.user", "username")
      .populate("members.team", "name totalPoints")
      .exec();

    leagues.forEach((league) => {
      league.members.sort((a, b) => {
        const aPoints = a.team?.totalPoints || 0;
        const bPoints = b.team?.totalPoints || 0;
        return bPoints - aPoints;
      });
    });

    res.json(leagues);
  } catch (error) {
    console.error("Error fetching user's leagues:", error);
    res.status(500).json({ error: "Failed to fetch leagues" });
  }
});

module.exports = router;
