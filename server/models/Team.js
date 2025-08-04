const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
  name: { type: String, default: "My team" },
  players: [
    {
      player: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
        required: true,
      },
      isSubstitute: {
        type: Boolean,
        default: true,
      },
      isCaptain: {
        type: Boolean,
        default: false,
      },
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  budget: { type: Number, default: 10000 },
  gameweekPoints: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
});

module.exports = mongoose.model("Team", teamSchema);
