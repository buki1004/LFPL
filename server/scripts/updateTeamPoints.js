require("dotenv").config();

const mongoose = require("mongoose");
const Player = require("./models/Player");
const Team = require("./models/Team");

async function updatePoints() {
  const allTeams = await Team.find().populate("players.player");
  const teamUpdates = allTeams.map((team) => {
    const gameweekPoints = team.players.reduce((sum, p) => {
      if (p.isSubstitute) return sum;
      const basePoints = p.player?.gameweekPoints || 0;
      const finalPoints = p.isCaptain ? basePoints * 2 : basePoints;

      return sum + finalPoints;
    }, 0);
    return {
      updateOne: {
        filter: { _id: team._id },
        update: {
          $set: {
            gameweekPoints,
            totalPoints: (team.totalPoints || 0) + gameweekPoints,
          },
        },
      },
    };
  });

  if (teamUpdates.length > 0) {
    await Team.bulkWrite(teamUpdates);
  }
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    await updatePoints();
    console.log("Team points updated successfully");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
