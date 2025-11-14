import React, { useEffect, useState, useMemo } from "react";
import "./App.css";
import styles from "./App.module.css";
import pitch from "./images/pitch.png";
import { getLastName, getPlayerCoordinates } from "./utils/teamUtils";

const App = () => {
  const [teamOfTheWeek, setTeamOfTheWeek] = useState(null);
  const [totwPoints, setTotwPoints] = useState(0);
  const [fixtures, setFixtures] = useState([]);
  const [loadingFixtures, setLoadingFixtures] = useState(true);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [selectedFixture, setSelectedFixture] = useState(null);
  const [fixtureDetails, setFixtureDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [modalOpenForPlayer, setModalOpenForPlayer] = useState(false);

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

        const total = teamOfTheWeekData.players
          .filter((p) => !p.isSubstitute)
          .reduce(
            (sum, p) =>
              sum + (p.gameweekPoints || p.player?.gameweekPoints || 0),
            0
          );

        setTotwPoints(total);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
  }, []);

  const handleFixtureClick = async (fixture) => {
    setSelectedFixture(fixture);
    setLoadingDetails(true);
    setFixtureDetails(null);
    try {
      const res = await fetch(`/api/fixtures/${fixture.fixture.id}`);
      const data = await res.json();

      console.log("Fetched fixture data:", data);

      setFixtureDetails(data.response || []);
    } catch (err) {
      console.error("Failed to fetch fixture details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setSelectedFixture(null);
    setFixtureDetails(null);
  };

  const renderPlayerStats = (player) => {
    switch (player.position) {
      case "Goalkeeper":
        return (
          <div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🧍</span>
              <span className={styles.statLabel}>Apps:</span>
              <span className={styles.statValue}>
                {player.statistics.appearances}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statLabel}>Minutes:</span>
              <span className={styles.statValue}>
                {player.statistics.minutes}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🧤</span>
              <span className={styles.statLabel}>Saves:</span>
              <span className={styles.statValue}>
                {player.statistics.saves}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>❌</span>
              <span className={styles.statLabel}>Goals conceded:</span>
              <span className={styles.statValue}>
                {player.statistics.conceded}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Assists:</span>
              <span className={styles.statValue}>
                {player.statistics.assists}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Goals scored:</span>
              <span className={styles.statValue}>
                {player.statistics.goals}
              </span>
            </div>
          </div>
        );
      case "Defender":
        return (
          <div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🧍</span>
              <span className={styles.statLabel}>Apps:</span>
              <span className={styles.statValue}>
                {player.statistics.appearances}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statLabel}>Minutes:</span>
              <span className={styles.statValue}>
                {player.statistics.minutes}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🛡️</span>
              <span className={styles.statLabel}>Tackles:</span>
              <span className={styles.statValue}>
                {player.statistics.tackles}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🛡️</span>
              <span className={styles.statLabel}>Interceptions:</span>
              <span className={styles.statValue}>
                {player.statistics.interceptions}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🛡️</span>
              <span className={styles.statLabel}>Duels won:</span>
              <span className={styles.statValue}>
                {player.statistics.duelsWon}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Assists:</span>
              <span className={styles.statValue}>
                {player.statistics.assists}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Goals scored:</span>
              <span className={styles.statValue}>
                {player.statistics.goals}
              </span>
            </div>
          </div>
        );
      case "Midfielder":
        return (
          <div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🧍</span>
              <span className={styles.statLabel}>Apps:</span>
              <span className={styles.statValue}>
                {player.statistics.appearances}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statLabel}>Minutes:</span>
              <span className={styles.statValue}>
                {player.statistics.minutes}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🎯</span>
              <span className={styles.statLabel}>Passes:</span>
              <span className={styles.statValue}>
                {player.statistics.passes}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🎯</span>
              <span className={styles.statLabel}>Key passes:</span>
              <span className={styles.statValue}>
                {player.statistics.keyPasses}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Assists:</span>
              <span className={styles.statValue}>
                {player.statistics.assists}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Goals scored:</span>
              <span className={styles.statValue}>
                {player.statistics.goals}
              </span>
            </div>
          </div>
        );
      case "Attacker":
        return (
          <div className={styles.stats}>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>🧍</span>
              <span className={styles.statLabel}>Apps:</span>
              <span className={styles.statValue}>
                {player.statistics.appearances}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statLabel}>Minutes:</span>
              <span className={styles.statValue}>
                {player.statistics.minutes}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Assists:</span>
              <span className={styles.statValue}>
                {player.statistics.assists}
              </span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statIcon}>⚽</span>
              <span className={styles.statLabel}>Goals scored:</span>
              <span className={styles.statValue}>
                {player.statistics.goals}
              </span>
            </div>
          </div>
        );
    }
  };

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
                &lt;
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
                &gt;
              </button>
            </div>

            {}
            <div>
              {currentFixtures.map((f) => (
                <div
                  key={f.fixture.id}
                  className={styles.fixtureCard}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleFixtureClick(f)}
                >
                  <div className={styles.fixtureTeam}>
                    <img
                      src={getTeamLogo(f.teams.home.name)}
                      alt={f.teams.home.name}
                    />
                    <span>{f.teams.home.name}</span>
                  </div>

                  <div className={styles.fixtureScore}>
                    {f.fixture.status.short === "NS" ? (
                      <>To be played</>
                    ) : (
                      <>
                        {f.goals.home} - {f.goals.away}
                      </>
                    )}
                  </div>

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
      <div className={styles.leagueList}>
        <h1>Team of the week</h1>
        {!teamOfTheWeek ? (
          <p>Loading Team of the Week...</p>
        ) : (
          <>
            <div className={styles.pointsBar}>
              <div className={styles.pointsBox}>
                <span className={styles.pointsLabel}>Total</span>
                <span className={styles.pointsValue}>{totwPoints || "0"}</span>
              </div>
            </div>
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
                      onClick={() => setModalOpenForPlayer(player)}
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
                  <div
                    key={player.player._id}
                    className={styles.subCard}
                    onClick={() => setModalOpenForPlayer(player)}
                  >
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
      {selectedFixture && (
        <div className={styles.fixtureModalOverlay} onClick={closeModal}>
          <div
            className={styles.fixtureModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={closeModal}>
              &times;
            </button>

            <h2 className={styles.fixtureTitle}>
              <img
                src={getTeamLogo(selectedFixture.teams.home.name)}
                alt={selectedFixture.teams.home.name}
                className={styles.fixtureTeamLogo}
              />{" "}
              {selectedFixture.goals.home} - {selectedFixture.goals.away}{" "}
              <img
                src={getTeamLogo(selectedFixture.teams.away.name)}
                alt={selectedFixture.teams.away.name}
                className={styles.fixtureTeamLogo}
              />
            </h2>

            {loadingDetails ? (
              <p>Loading fixture details...</p>
            ) : fixtureDetails.length > 0 ? (
              (() => {
                const homeTeamEvents = fixtureDetails
                  .filter((e) => e.team.id === selectedFixture.teams.home.id)
                  .sort((a, b) => a.time.elapsed - b.time.elapsed);

                const awayTeamEvents = fixtureDetails
                  .filter((e) => e.team.id === selectedFixture.teams.away.id)
                  .sort((a, b) => a.time.elapsed - b.time.elapsed);

                const renderEvent = (event) => {
                  let icon = "";
                  if (event.type.toLowerCase() === "goal") icon = "⚽";
                  else if (event.type.toLowerCase() === "card") {
                    icon = event.detail.toLowerCase().includes("yellow")
                      ? "🟨"
                      : "🟥";
                  } else if (event.type.toLowerCase() === "subst") icon = "🔄";

                  return (
                    <div
                      key={event.time.elapsed + Math.random()}
                      className={`${styles.eventCard} ${styles[event.type]}`}
                    >
                      <span className={styles.eventIcon}>{icon}</span>
                      <span className={styles.eventText}>
                        {event.time?.elapsed}' {event.player?.name ?? "Unknown"}
                        {event.type.toLowerCase() === "goal" &&
                        event.assist?.name
                          ? ` (Assist: ${event.assist.name})`
                          : ""}
                      </span>
                    </div>
                  );
                };

                return (
                  <div className={styles.eventsContainer}>
                    <div className={styles.teamEvents}>
                      <h3>{selectedFixture.teams.home.name}</h3>
                      {homeTeamEvents.map(renderEvent)}
                    </div>

                    <div className={styles.teamEvents}>
                      <h3>{selectedFixture.teams.away.name}</h3>
                      {awayTeamEvents.map(renderEvent)}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p>No detailed events available.</p>
            )}
          </div>
        </div>
      )}
      {modalOpenForPlayer && (
        <div className={styles.playerModalOverlay}>
          <div className={styles.playerModalContent}>
            <img
              src={getTeamLogo(
                modalOpenForPlayer.player?.teamName ||
                  modalOpenForPlayer.teamName
              )}
              className={styles.teamLogo}
            />
            <h3>
              {modalOpenForPlayer.player?.name || modalOpenForPlayer.name}
            </h3>
            <div className={styles.pointsBar}>
              <div className={styles.pointsBox}>
                <span className={styles.pointsLabel}>GW</span>
                <span className={styles.pointsValue}>
                  {modalOpenForPlayer.player?.gameweekPoints ||
                    modalOpenForPlayer.gameweekPoints ||
                    "0"}
                </span>
              </div>
              <div className={styles.pointsBox}>
                <span className={styles.pointsLabel}>Total</span>
                <span className={styles.pointsValue}>
                  {modalOpenForPlayer.player?.totalPoints ||
                    modalOpenForPlayer.totalPoints ||
                    "0"}
                </span>
              </div>
            </div>
            <p>
              {(modalOpenForPlayer.player?.name || modalOpenForPlayer.name) +
                "'s season statistics:"}
            </p>
            <div className={styles.stats}>
              {renderPlayerStats(
                modalOpenForPlayer.player || modalOpenForPlayer
              )}
            </div>
            <button
              className={styles.closeBtn}
              onClick={() => setModalOpenForPlayer(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
