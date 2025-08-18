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
        newPrice = Math.round(
          (Math.round((stats.saves * 0.8 + 4) * 10) / 10) * 100
        );
      } else if (pos === "Defender") {
        newPrice = Math.round(
          (Math.round((stats.interceptions * 0.5 + 4) * 10) / 10) * 100
        );
      } else if (pos === "Midfielder") {
        if (player.price == "400") {
          newPrice = 450;
        } else {
          newPrice = Math.round(
            (Math.round(
              (stats.goals * 1.2 +
                stats.assists * 0.6 +
                stats.keyPasses * 0.2 +
                4) *
                10
            ) /
              10) *
              100
          );
        }
      } else if (pos === "Attacker") {
        if (player.price == "400") {
          newPrice = 450;
        } else {
          newPrice = Math.round(
            (Math.round((stats.goals * 1.5 + stats.assists * 0.75 + 4) * 10) /
              10) *
              100
          );
        }
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
