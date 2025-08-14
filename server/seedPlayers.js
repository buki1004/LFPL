const mongoose = require("mongoose");
const fs = require("fs");
const Player = require("./models/Player");

mongoose.connect("mongodb://localhost:27017/fpl", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedPlayers() {
  try {
    const raw = fs.readFileSync("allPlayers.json");
    const json = JSON.parse(raw);

    const playersToInsert = json.response.map((p) => {
      const stats = p.statistics[0]; // first stats object
      return {
        id: p.player.id,
        name: p.player.name,
        position: stats.games.position,
        price: p.player.price || 0,
        gameweekPoints: 0,
        totalPoints: p.player.points || 0,
        teamName: stats.team.name,
        statistics: {
          appearances: stats.games.appearences || 0,
          minutes: stats.games.minutes || 0,
          conceded: stats.goals.conceded || 0,
          saves: stats.goals.saves || 0,
          tackles: stats.tackles.total || 0,
          interceptions: stats.tackles.interceptions || 0,
          duels: stats.duels.total || 0,
          duelsWon: stats.duels.won || 0,
          passes: stats.passes.total || 0,
          keyPasses: stats.passes.key || 0,
          assists: stats.goals.assists || 0,
          goals: stats.goals.total || 0,
          yellows: stats.cards.yellow || 0,
          reds: stats.cards.red || 0,
        },
      };
    });

    // Clear old data and insert new
    await Player.deleteMany({});
    await Player.insertMany(playersToInsert);

    console.log(`Inserted ${playersToInsert.length} players`);
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seedPlayers();
