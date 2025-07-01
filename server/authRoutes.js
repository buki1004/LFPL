const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Team = require("./models/Team");

router.get("/signup", (req, res) => {
  res.status(405).json({ error: "Use POST to sign up" });
});

router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email }).select("_id");
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists", clearAuth: true });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({ email, password: hashedPassword });
    const team = new Team({
      name: `${email}'s Team`,
      players: [],
      owner: user._id,
    });

    await team.save();
    user.team = team._id;
    await user.save();

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created successfully",
      token,
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", clearAuth: true });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).populate("team");

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ _id: user._id }, "your-secret-key", {
      expiresIn: "1h",
    });

    res.json({
      token,
      userId: user._id,
      teamId: user.team?._id,
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/logout", async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

router.post("/", async (req, res) => {
  try {
    const { userId, players, budget } = req.body;
    const team = new Team({
      players: players.map((p) => ({
        id: p.player.id,
        name: p.player.name,
        position: p.statistics[0].games.position,
        price: p.player.price,
        points: p.player.points,
        statistics: {
          appearances: p.statistics[0].games.appearances,
          minutes: p.statistics[0].games.minutes,
          conceded: p.statistics[0].goals.conceded,
          saves: p.statistics[0].goals.saves,
          tackles: p.statistics[0].tackles.total,
          interceptions: p.statistics[0].tackles.interceptions,
          duels: p.statistics[0].duels.total,
          duelsWon: p.statistics[0].duels.won,
          passes: p.statistics[0].passes.total,
          keyPasses: p.statistics[0].passes.key,
          assists: p.statistics[0].goals.assists,
          goals: p.statistics[0].goals.total,
          yellows: p.statistics[0].cards.yellow,
          reds: p.statistics[0].cards.red,
        },
      })),
      owner: userId,
      budget: budget,
    });

    await team.save();
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const team = await Team.findOne({ owner: req.params.userId });
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
