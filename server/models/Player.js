const mongoose = require("mongoose");

const playerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  position: { type: String, required: true },
  price: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  statistics: {
    appearances: Number,
    minutes: Number,
    conceded: Number,
    saves: Number,
    tackles: Number,
    interceptions: Number,
    duels: Number,
    duelsWon: Number,
    passes: Number,
    keyPasses: Number,
    assists: Number,
    goals: Number,
    yellows: Number,
    reds: Number,
  },
});

module.exports = mongoose.model("Player", playerSchema);
