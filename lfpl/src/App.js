import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";
import styles from "./App.module.css";
import pitch from "./images/pitch.png";
import { getLastName, getPlayerCoordinates } from "./utils/teamUtils";

const App = () => {
  const [userTeam, setUserTeam] = useState(null);
  const [teamOfTheWeek, setTeamOfTheWeek] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [modalOpenForPlayer, setModalOpenForPlayer] = useState(null);
  const navigate = useNavigate();

  const logos = {
    Arsenal: require("./images/Arsenal.png"),
    "Aston Villa": require("./images/Aston Villa.png"),
    Bournemouth: require("./images/Bournemouth.png"),
    Brentford: require("./images/Brentford.png"),
    Brighton: require("./images/Brighton.png"),
    Chelsea: require("./images/Chelsea.png"),
    "Crystal Palace": require("./images/Crystal Palace.png"),
    Everton: require("./images/Everton.png"),
    Fulham: require("./images/Fulham.png"),
    Liverpool: require("./images/Liverpool.png"),
    "Manchester City": require("./images/Manchester City.png"),
    "Manchester United": require("./images/Manchester United.png"),
    Newcastle: require("./images/Newcastle.png"),
    Nottingham: require("./images/Nottingham.png"),
    "Nottingham Forest": require("./images/Nottingham.png"),
    Tottenham: require("./images/Tottenham.png"),
    "West Ham": require("./images/West Ham.png"),
    Wolves: require("./images/Wolves.png"),
  };

  const getTeamLogo = (teamName) => {
    return logos[teamName];
  };

  const removeFromTeam = async (player) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/team/remove-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          player: {
            _id: player.playerId,
            price: player.price,
          },
        }),
      });

      const result = await response.text();
      if (!response.ok) {
        alert("Error: " + JSON.parse(result).error);
        throw new Error(JSON.parse(result).error || "Failed to remove player ");
      }

      const updatedTeam = JSON.parse(result);
      setUserTeam(updatedTeam);
      console.log("Successfully removed player from team!");
    } catch (error) {
      console.error("Failed to remove player:", error);
    }
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

  const simulatePoints = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/pointsTest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setUserPoints(data.gameweekPoints);
      setTotalPoints(data.totalPoints);
    } catch (error) {
      console.error("Simulation failed: ", error);
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

  const makeCaptain = async (player) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/team/make-captain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId: player.player._id }),
      });

      if (!response.ok) throw new Error("Failed to set captain");

      const updatedTeam = await response.json();
      setUserTeam(updatedTeam);
    } catch (error) {
      console.log("Error");
    }
  };

  const makeSubstitute = async (player) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/team/substitute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId: player.player._id }),
      });

      if (!response.ok) throw new Error("Failed to make substitute");

      console.log("Succes at doing sub");
      const updatedTeam = await response.json();
      setUserTeam(updatedTeam);
    } catch (error) {
      console.log("Not good");
    }
  };

  const saveTeam = () => {
    const positions = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Attacker: 0,
    };

    userTeam.players.forEach((p) => {
      if (!p.isSubstitute) {
        const pos = p.player.position;
        if (pos in positions) {
          positions[pos]++;
        }
      }
    });

    console.log(positions);

    if (
      positions.Goalkeeper < 1 ||
      positions.Defender < 3 ||
      positions.Midfielder < 3 ||
      positions.Attacker < 1
    ) {
      alert(
        "Your team needs to have at least 1 Goalkeeper, 3 Defenders, 3 Midfielders, 1 Attacker"
      );
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [teamResponse, teamOfTheWeekResponse, pointsResponse] =
          await Promise.all([
            fetch("/api/team/my-team", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("/api/team/totw"),
            fetch("/api/fetchPoints", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

        const [teamData, teamOfTheWeekData, pointsData] = await Promise.all([
          teamResponse.json(),
          teamOfTheWeekResponse.json(),
          pointsResponse.json(),
        ]);

        setUserTeam(teamData);
        setTeamOfTheWeek(teamOfTheWeekData);
        setUserPoints(pointsData.gameweekPoints);
        setTotalPoints(pointsData.totalPoints);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.layoutContainer}>
      <div className="accountList">
        <h1>My Team</h1>
        <button onClick={() => handleLogout()}>Logout</button>
        {userTeam ? (
          <div>
            <h2>
              GW points: {userPoints} Total points: {totalPoints}
            </h2>
            <button onClick={() => simulatePoints()}>Simulate</button>
            <h2>
              Your budget: {parseFloat((userTeam.budget / 100).toFixed(2))}
            </h2>
            <button onClick={() => saveTeam()}>Save team</button>
            <h2>Starters</h2>
            {groupAndSortPlayers(
              userTeam.players.filter((p) => !p.isSubstitute)
            ).map(([position, players]) => (
              <div key={position}>
                <h3>
                  {position}s ({players.length})
                </h3>
                <ul className="teamList">
                  {players.map((player) => (
                    <li key={player._id}>
                      <button onClick={() => setModalOpenForPlayer(player._id)}>
                        Click Me
                      </button>
                      {player.isCaptain ? (
                        <strong>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.gameweekPoints * 2}
                        </strong>
                      ) : (
                        <>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.gameweekPoints}
                        </>
                      )}
                      <button onClick={() => removeFromTeam(player)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <h2>Substitutes</h2>
            {groupAndSortPlayers(
              userTeam.players.filter((p) => p.isSubstitute)
            ).map(([position, players]) => (
              <div key={position}>
                <h3>
                  {position}s ({players.length})
                </h3>
                <ul className="teamList">
                  {players.map((player) => (
                    <li key={player._id}>
                      <button onClick={() => setModalOpenForPlayer(player._id)}>
                        Click Me
                      </button>
                      {player.isCaptain ? (
                        <strong>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.gameweekPoints}
                        </strong>
                      ) : (
                        <>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.gameweekPoints}
                        </>
                      )}
                      <button onClick={() => removeFromTeam(player)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p>No team yet! Add players above.</p>
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
      {modalOpenForPlayer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              {
                userTeam?.players.find((p) => p._id === modalOpenForPlayer)
                  ?.player?.name
              }
            </h3>
            <button
              onClick={() => {
                makeCaptain(
                  userTeam.players.find((p) => p._id === modalOpenForPlayer)
                );
                setModalOpenForPlayer(null);
              }}
            >
              Make captain
            </button>
            <button
              onClick={() => {
                makeSubstitute(
                  userTeam.players.find((p) => p._id === modalOpenForPlayer)
                );
                setModalOpenForPlayer(null);
              }}
            >
              Sub
            </button>
            <button
              className="close-btn"
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
