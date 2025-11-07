require("dotenv").config();
const fs = require("fs");
const axios = require("axios");

const FIXTURE_FILE = "./allFixtures.json";

async function updateFixtures() {
  const raw = fs.readFileSync(FIXTURE_FILE, "utf-8");
  const localFixtures = JSON.parse(raw);

  const res = await axios.get(
    "https://v3.football.api-sports.io/fixtures?league=39&season=2025",
    { headers: { "x-apisports-key": process.env.API_KEY } }
  );

  const apiFixtures = res.data.response;
  const updatedFixtures = [];

  for (const apiF of apiFixtures) {
    const localIndex = localFixtures.response.findIndex(
      (lf) => lf.fixture.id === apiF.fixture.id
    );
    if (localIndex === -1) continue;

    const localFix = localFixtures.response[localIndex];

    if (
      localFix.fixture.status.short === "NS" &&
      apiF.fixture.status.short === "FT"
    ) {
      localFixtures.response[localIndex] = apiF;

      // Save info for logging
      const homeTeam = apiF.teams.home.name;
      const awayTeam = apiF.teams.away.name;
      const homeGoals = apiF.goals.home;
      const awayGoals = apiF.goals.away;
      updatedFixtures.push(
        `Fixture ${apiF.fixture.id} (${homeTeam} ${homeGoals}:${awayGoals} ${awayTeam}) updated to FT`
      );
    }
  }

  fs.writeFileSync(FIXTURE_FILE, JSON.stringify(localFixtures, null, 2));

  if (updatedFixtures.length > 0) {
    console.log("Updated fixtures:");
    updatedFixtures.forEach((f) => console.log(f));
  } else {
    console.log("No fixtures were updated.");
  }
}

updateFixtures();
