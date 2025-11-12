require("dotenv").config();
const fs = require("fs");
const path = require("path");

const queuePath = path.join(__dirname, "../eventsQueue.json");
const eventsPath = path.join(__dirname, "../fixtureEvents.json");

async function fetchFixtureEvents() {
  if (!fs.existsSync(queuePath)) {
    console.log("No queue file found. Nothing to process.");
    return;
  }

  let queue = JSON.parse(fs.readFileSync(queuePath, "utf8"));
  if (queue.length === 0) {
    console.log("Event queue is empty.");
    return;
  }

  const existingEvents = fs.existsSync(eventsPath)
    ? JSON.parse(fs.readFileSync(eventsPath, "utf8"))
    : {};

  for (const fixtureId of queue) {
    try {
      console.log(`Fetching events for fixture ${fixtureId}...`);

      const res = await fetch(
        `https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`,
        {
          method: "GET",
          headers: { "x-apisports-key": process.env.API_KEY },
        }
      );

      const data = await res.json();

      if (data.response && data.response.length > 0) {
        existingEvents[fixtureId] = data;
        console.log(`Fetched and stored events for fixture ${fixtureId}`);
      } else {
        console.log(`No event data for fixture ${fixtureId}`);
      }

      fs.writeFileSync(eventsPath, JSON.stringify(existingEvents, null, 2));
    } catch (err) {
      console.error(`Error fetching events for fixture ${fixtureId}:`, err);
    }
  }

  fs.writeFileSync(queuePath, JSON.stringify([], null, 2));
  console.log("All queued fixtures processed!");
}

fetchFixtureEvents();
