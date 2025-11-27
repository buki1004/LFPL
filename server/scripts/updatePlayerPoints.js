require("dotenv").config();

const mongoose = require("mongoose");
const Player = require("../models/Player");
const fixtures = require("../allFixtures.json");
const fs = require("fs");
const path = require("path");
const fixturesPath = path.join(__dirname, "../allFixtures.json");

function calculatePoints(playerStats, position, fixture, teamName) {
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

  if (
    (position === "G" || position === "D") &&
    playerStats.games.minutes >= 45
  ) {
    const isHome = teamName === fixture.teams.home.name;

    if (isHome && fixture.goals.away === 0) points += 4;
    else if (!isHome && fixture.goals.home === 0) points += 4;
  }

  points -= playerStats.cards.yellow || 0;
  points -= (playerStats.cards.red || 0) * 3;

  return points;
}

async function updatePlayerPoints() {
  const unprocessedFixtures = fixtures.response.filter(
    (fix) =>
      fix.fixture.status.short === "FT" &&
      !fix.fixture.status.short.includes("-processed")
  );

  if (unprocessedFixtures.length === 0) {
    console.log("No new finished fixtures to process.");
    return;
  }

  for (const fix of unprocessedFixtures) {
    const fixtureId = fix.fixture.id;
    console.log(`\nProcessing fixture ${fixtureId}...`);

    let roundNumber = null;
    if (fix.league.round) {
      const match = fix.league.round.match(/(\d+)$/);
      if (match) {
        roundNumber = parseInt(match[1], 10);
      }
    }

    let data;
    try {
      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures/players?fixture=${fixtureId}`,
        {
          method: "GET",
          headers: { "x-rapidapi-key": process.env.API_KEY },
        }
      );
      data = await res.json();
      if (!data.response || data.response.length === 0) {
        console.log(
          `No player data for fixture ${fixtureId}. Full response:`,
          data
        );
        continue;
      }
    } catch (err) {
      console.error(`Error fetching fixture ${fixtureId}:`, err);
      continue;
    }

    if (roundNumber !== null) {
      const playerIds = data.response.flatMap((team) =>
        team.players.map((p) => p.player.id)
      );
      const dbPlayers = await Player.find({ id: { $in: playerIds } });

      const anyAlreadyPlayed = dbPlayers.some(
        (p) => (p.statistics.appearances || 0) >= roundNumber
      );

      if (anyAlreadyPlayed) {
        console.log(
          `Skipping fixture ${fixtureId} because at least one player already has appearances >= round ${roundNumber}`
        );
        continue;
      }
    }

    let anyPlayerUpdated = false;
    let updatedPlayersCount = 0;
    const saveOps = [];

    for (const team of data.response) {
      for (const p of team.players) {
        const stats = p.statistics[0];
        if (!stats) {
          console.log(`Skipping player ${p.player.id}: no stats available`);
          continue;
        }

        const playerId = p.player.id;
        const position = stats.games.position;
        if (!position) {
          console.log(`Skipping player ${playerId}: missing position`);
          continue;
        }

        const playerInDb = await Player.findOne({ id: playerId });
        if (!playerInDb) {
          console.log(`Player not found in DB: ${playerId}`);
          continue;
        }

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

        const points = calculatePoints(stats, position, fix, team.team.name);
        playerInDb.gameweekPoints = points;
        playerInDb.totalPoints += points;

        saveOps.push(playerInDb.save());
        anyPlayerUpdated = true;
        updatedPlayersCount++;

        console.log(
          `Updated player: ${playerInDb.name || playerId}, team: ${
            team.team.name
          }, GW points: ${points}`
        );
      }
    }

    await Promise.all(saveOps);

    const homeTeam = fix.teams.home.name;
    const awayTeam = fix.teams.away.name;
    const homeGoals = fix.goals.home;
    const awayGoals = fix.goals.away;

    if (anyPlayerUpdated) {
      const localFix = fixtures.response.find(
        (f) => f.fixture.id === fixtureId
      );
      if (localFix) {
        localFix.fixture.status.short += "-processed";
        localFix.fixture.status.long += "-processed";
      }
      console.log(
        `Fixture ${fixtureId} (${homeTeam} ${homeGoals}:${awayGoals} ${awayTeam}) processed successfully. Total players updated: ${updatedPlayersCount}`
      );
    } else {
      console.log(
        `No players updated for fixture ${fixtureId} (${homeTeam} ${homeGoals}:${awayGoals} ${awayTeam}), fixture will remain unprocessed`
      );
    }

    const queuePath = path.join(__dirname, "../eventsQueue.json");

    let eventsQueue = [];
    if (fs.existsSync(queuePath)) {
      eventsQueue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
    }

    if (!eventsQueue.includes(fixtureId)) {
      eventsQueue.push(fixtureId);
      fs.writeFileSync(queuePath, JSON.stringify(eventsQueue, null, 2));
      console.log(`Added fixture ${fixtureId} to event-fetch queue.`);
    }
  }

  fs.writeFileSync(fixturesPath, JSON.stringify(fixtures, null, 2));

  console.log("Player points updated and fixtures marked as processed!");
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB");
    await updatePlayerPoints();
    await mongoose.connection.close();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
