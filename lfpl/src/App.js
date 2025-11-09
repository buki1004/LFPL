import React, { useEffect, useState, useMemo } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import styles from "./App.module.css";
import pitch from "./images/pitch.png";
import { getLastName, getPlayerCoordinates } from "./utils/teamUtils";

const App = () => {
  const [teamOfTheWeek, setTeamOfTheWeek] = useState(null);
  const [fixtures, setFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const navigate = useNavigate();

  const logos = {
    Arsenal: require("./images/Arsenal.png"),
    "Aston Villa": require("./images/Aston Villa.png"),
    Bournemouth: require("./images/Bournemouth.png"),
    Brentford: require("./images/Brentford.png"),
    Brighton: require("./images/Brighton.png"),
    Burnley: require("./images/Burnley.png"),
    Chelsea: require("./images/Chelsea.png"),
    "Crystal Palace": require("./images/Crystal Palace.png"),
    Everton: require("./images/Everton.png"),
    Fulham: require("./images/Fulham.png"),
    Leeds: require("./images/Leeds.png"),
    Liverpool: require("./images/Liverpool.png"),
    "Manchester City": require("./images/Manchester City.png"),
    "Manchester United": require("./images/Manchester United.png"),
    Newcastle: require("./images/Newcastle.png"),
    Nottingham: require("./images/Nottingham.png"),
    "Nottingham Forest": require("./images/Nottingham.png"),
    Sunderland: require("./images/Sunderland.png"),
    Tottenham: require("./images/Tottenham.png"),
    "West Ham": require("./images/West Ham.png"),
    Wolves: require("./images/Wolves.png"),
  };

  const getTeamLogo = (teamName) => {
    return logos[teamName];
  };

  const getMostRecentProcessedRoundIndex = (grouped) => {
    const rounds = Object.keys(grouped);
    const sortedRounds = rounds.sort((a, b) => {
      const numA = parseInt(a.split(" - ")[1]);
      const numB = parseInt(b.split(" - ")[1]);
      return numA - numB;
    });

    for (let i = sortedRounds.length - 1; i >= 0; i--) {
      const fixtures = grouped[sortedRounds[i]];
      if (fixtures.some((f) => f.fixture.status.short?.includes("FT"))) {
        return i;
      }
    }

    return sortedRounds.length - 1;
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("teamId");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
    }
  };

  const groupAndSortPlayers = (players = []) => {
    const positionOrder = {
      Goalkeeper: 0,
      Defender: 1,
      Midfielder: 2,
      Attacker: 3,
    };

    const grouped = players.reduce((acc, entry) => {
      if (!entry.player || !entry.player.position) return acc;

      const position = entry.player.position;
      if (!acc[position]) acc[position] = [];

      acc[position].push({
        ...entry.player,
        isSubstitute: entry.isSubstitute,
        isCaptain: entry.isCaptain,
        playerId: entry.player._id,
        _id: entry._id,
      });

      return acc;
    }, {});

    Object.keys(grouped).forEach((position) => {
      grouped[position].sort((a, b) => {
        if (b.price !== a.price) {
          return b.price - a.price;
        }
        return a.name.localeCompare(b.name);
      });
    });

    return Object.entries(grouped).sort(
      ([aPos], [bPos]) => positionOrder[aPos] - positionOrder[bPos]
    );
  };

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await fetch("/api/fixtures");
        const data = await res.json();
        console.log("Fixtures response:", data);
        setFixtures(data.response);
      } catch (err) {
        console.error("Failed to load fixtures:", err);
      } finally {
        setLoadingFixtures(false);
      }
    };
    fetchFixtures();
  }, []);

  const fixturesByRound = useMemo(() => {
    const grouped = {};
    fixtures.forEach((fixture) => {
      const round = fixture.league.round;
      if (!grouped[round]) grouped[round] = [];
      grouped[round].push(fixture);
    });
    return grouped;
  }, [fixtures]);

  const rounds = useMemo(() => {
    return Object.keys(fixturesByRound).sort((a, b) => {
      const numA = parseInt(a.split(" - ")[1]);
      const numB = parseInt(b.split(" - ")[1]);
      return numA - numB;
    });
  }, [fixturesByRound]);

  useEffect(() => {
    if (rounds.length === 0) return;
    const recentIndex = getMostRecentProcessedRoundIndex(fixturesByRound);
    setCurrentRoundIndex(recentIndex);
  }, [rounds, fixturesByRound]);

  const currentRound = rounds[currentRoundIndex];
  const currentFixtures = fixturesByRound[currentRound] || [];

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const teamOfTheWeekResponse = await fetch("/api/team/totw");

        const teamOfTheWeekData = await teamOfTheWeekResponse.json();

        setTeamOfTheWeek(teamOfTheWeekData);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.accountList}>
        <h1>Fixtures</h1>

        {loadingFixtures ? (
          <p>Loading fixtures...</p>
        ) : (
          <div className={styles.fixturesContainer}>
            {}
            <div className={styles.navButtons}>
              <button
                onClick={() => setCurrentRoundIndex((i) => Math.max(i - 1, 0))}
                disabled={currentRoundIndex === 0}
                className={`${styles.forwardBackButton} ${styles.left}`}
              >
                ←
              </button>

              <h2 className={styles.gameweekHeader}>
                {currentRound
                  ? currentRound.replace("Regular Season - ", "Gameweek ")
                  : "No fixtures"}
              </h2>

              <button
                onClick={() =>
                  setCurrentRoundIndex((i) =>
                    Math.min(i + 1, rounds.length - 1)
                  )
                }
                disabled={currentRoundIndex === rounds.length - 1}
                className={`${styles.forwardBackButton} ${styles.right}`}
              >
                →
              </button>
            </div>

            {}
            <div>
              {currentFixtures.map((f) => (
                <div key={f.fixture.id} className={styles.fixtureCard}>
                  {}
                  <div className={styles.fixtureTeam}>
                    <img
                      src={getTeamLogo(f.teams.home.name)}
                      alt={f.teams.home.name}
                    />
                    <span>{f.teams.home.name}</span>
                  </div>

                  {}
                  <div className={styles.fixtureScore}>
                    {f.fixture.status.short === "NS" ? (
                      <>To be played</>
                    ) : (
                      <>
                        {f.goals.home} - {f.goals.away}
                      </>
                    )}
                  </div>

                  {}
                  <div className={styles.fixtureTeam}>
                    <span>{f.teams.away.name}</span>
                    <img
                      src={getTeamLogo(f.teams.away.name)}
                      alt={f.teams.away.name}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className={styles.accountList}>
        <h1>Team of the week</h1>
        {!teamOfTheWeek ? (
          <p>Loading Team of the Week...</p>
        ) : (
          <>
            <h2>Best lineup this gameweek</h2>
            <div className={styles.pitchContainer}>
              <img src={pitch} className={styles.pitchImage} />
              {groupAndSortPlayers(
                teamOfTheWeek.players.filter((p) => !p.isSubstitute)
              ).flatMap(([position, players]) =>
                players.map((player, idx) => {
                  const coords = getPlayerCoordinates(
                    position,
                    idx,
                    players.length
                  );
                  return (
                    <div
                      key={player._id}
                      className={styles.playerMarker}
                      style={{ top: coords.top, left: coords.left }}
                    >
                      <img
                        src={getTeamLogo(player.teamName)}
                        className={styles.teamLogo}
                      />
                      <div className={styles.playerName}>
                        {getLastName(player.name)}
                      </div>
                      <div className={styles.playerPoints}>
                        {player.gameweekPoints}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <h2>Substitutes</h2>
            <div className={styles.subContainer}>
              {teamOfTheWeek.players
                .filter((p) => p.isSubstitute)
                .map((player) => (
                  <div key={player.player._id} className={styles.subCard}>
                    <img
                      src={getTeamLogo(player.player.teamName)}
                      className={styles.teamLogo}
                    />
                    <div className={styles.playerName}>
                      {getLastName(player.player.name)}
                    </div>
                    <div className={styles.playerPoints}>
                      {player.player.gameweekPoints}
                    </div>
                    <div>{player.player.position.substring(0, 3)}</div>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
