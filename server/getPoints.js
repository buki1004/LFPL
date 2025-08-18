require("dotenv").config();

const mongoose = require("mongoose");
const Player = require("./models/Player");
const fixtures = require("./allFixtures.json");

function calculatePoints(playerStats, position, fixture) {
  if (!playerStats || !playerStats.games) {
    return 0;
  }
  let points = 0;

  if (playerStats.games.minutes >= 60) points += 2;
  else if (playerStats.games.minutes > 0) points += 1;

  const goals = playerStats.goals.total || 0;
  if (position === "G") points += goals * 20;
  else if (position === "D") points += goals * 6;
  else if (position === "M") points += goals * 5;
  else if (position === "F") points += goals * 4;

  points += (playerStats.goals.assists || 0) * 3;

  const goalsConceded =
    position === "G" || position === "D"
      ? fixture.goals.home === 0 &&
        playerStats.teamName === fixture.teams.home.name
        ? 4
        : fixture.goals.away === 0 &&
          playerStats.teamName === fixture.teams.away.name
        ? 4
        : 0
      : 0;

  points += goalsConceded;

  points -= playerStats.cards.yellow || 0;
  points -= (playerStats.cards.red || 0) * 3;

  return points;
}

async function updatePlayerPoints() {
  const finishedFixtures = fixtures.response.filter(
    (fix) => fix.fixture.status.short === "FT"
  );

  for (const fix of finishedFixtures) {
    const fixtureId = fix.fixture.id;

    console.log(`Processing fixture ${fix.fixture.id}...`);

    let data;

    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures/players?fixture=${fixtureId}`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key": process.env.API_KEY,
          },
        }
      );
      data = await res.json();
      if (!data.response) {
        console.log(`No data for fixture ${fixtureId}`);
        continue;
      }
    } catch (err) {
      console.error(`Error fetching fixture ${fixtureId}:`, err);
      continue;
    }
    if (!data.response) continue;

    for (const team of data.response) {
      for (const p of team.players) {
        const stats = p.statistics[0];
        if (!stats) continue;
        const playerId = p.player.id;
        const position = stats.games.position;
        if (!position) continue;

        const playerInDb = await Player.findOne({ id: playerId });
        if (!playerInDb) continue;

        playerInDb.gameweekPoints = 0;

        playerInDb.statistics.appearances =
          (playerInDb.statistics.appearances || 0) +
          (stats.games.minutes > 0 ? 1 : 0);
        playerInDb.statistics.minutes =
          (playerInDb.statistics.minutes || 0) + (stats.games.minutes || 0);
        playerInDb.statistics.conceded =
          (playerInDb.statistics.conceded || 0) + (stats.goals.conceded || 0);
        playerInDb.statistics.saves =
          (playerInDb.statistics.saves || 0) + (stats.goals.saves || 0);
        playerInDb.statistics.tackles =
          (playerInDb.statistics.tackles || 0) + (stats.tackles.total || 0);
        playerInDb.statistics.interceptions =
          (playerInDb.statistics.interceptions || 0) +
          (stats.tackles.interceptions || 0);
        playerInDb.statistics.duels =
          (playerInDb.statistics.duels || 0) + (stats.duels.total || 0);
        playerInDb.statistics.duelsWon =
          (playerInDb.statistics.duelsWon || 0) + (stats.duels.won || 0);
        playerInDb.statistics.passes =
          (playerInDb.statistics.passes || 0) + (stats.passes.total || 0);
        playerInDb.statistics.keyPasses =
          (playerInDb.statistics.keyPasses || 0) + (stats.passes.key || 0);
        playerInDb.statistics.assists =
          (playerInDb.statistics.assists || 0) + (stats.goals.assists || 0);
        playerInDb.statistics.goals =
          (playerInDb.statistics.goals || 0) + (stats.goals.total || 0);
        playerInDb.statistics.yellows =
          (playerInDb.statistics.yellows || 0) + (stats.cards.yellow || 0);
        playerInDb.statistics.reds =
          (playerInDb.statistics.reds || 0) + (stats.cards.red || 0);

        playerInDb.teamName = team.team.name;

        const points = calculatePoints(stats, position, fix);

        playerInDb.gameweekPoints = points;
        playerInDb.totalPoints += points;
        await playerInDb.save();
      }
    }
  }

  console.log("Player points updated for finished fixtures!");
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    await updatePlayerPoints();
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
