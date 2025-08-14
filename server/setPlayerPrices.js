const mongoose = require("mongoose");
const Player = require("./models/Player");

mongoose
  .connect("mongodb://localhost:27017/fpl", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");

    const players = await Player.find();
    console.log(`Found ${players.length} players.`);

    for (const player of players) {
      let newPrice = player.price;
      const pos = player.position;
      const stats = player.statistics || {};

      if (pos === "Goalkeeper") {
        newPrice = Math.round((stats.saves * 0.02 + 4) * 10) / 10;
      } else if (pos === "Defender") {
        newPrice = Math.round((stats.interceptions * 0.05 + 4) * 10) / 10;
      } else if (pos === "Midfielder") {
        newPrice =
          Math.round(
            (stats.goals * 0.1 +
              stats.assists * 0.05 +
              stats.keyPasses * 0.02 +
              4) *
              10
          ) / 10;
      } else if (pos === "Attacker") {
        newPrice =
          Math.round((stats.goals * 0.2 + stats.assists * 0.1 + 4) * 10) / 10;
      }

      if (player.price !== newPrice) {
        player.price = newPrice;
        await player.save();
      }
    }

    console.log("All player prices updated.");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
