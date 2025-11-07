require("dotenv").config();

const mongoose = require("mongoose");
const Player = require("./models/Player");

async function clearPlayersAll() {
  const result = await Player.updateMany(
    {},
    {
      $set: {
        gameweekPoints: 0,
        totalPoints: 0,
        "statistics.appearances": 0,
        "statistics.minutes": 0,
        "statistics.conceded": 0,
        "statistics.saves": 0,
        "statistics.tackles": 0,
        "statistics.interceptions": 0,
        "statistics.duels": 0,
        "statistics.duelsWon": 0,
        "statistics.passes": 0,
        "statistics.keyPasses": 0,
        "statistics.assists": 0,
        "statistics.goals": 0,
        "statistics.yellows": 0,
        "statistics.reds": 0,
      },
    }
  );

  console.log(`Reset done for ${result.modifiedCount} players`);
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    await clearPlayersAll();
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
