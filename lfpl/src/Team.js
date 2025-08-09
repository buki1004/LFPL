import React, { useEffect, useState } from "react";
import styles from "./Team.module.css";
import { useNavigate } from "react-router-dom";
import pitch from "./images/pitch.png";

const Team = () => {
  const [userTeam, setUserTeam] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLeagues, setUserLeagues] = useState([]);
  const [showCode, setShowCode] = useState({});
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
    Tottenham: require("./images/Tottenham.png"),
    "West Ham": require("./images/West Ham.png"),
    Wolves: require("./images/Wolves.png"),
  };

  const getTeamLogo = (teamName) => {
    return logos[teamName];
  };

  const getLastName = (x) => {
    const lastName = x.split(" ").pop();
    return lastName;
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

  const getPlayerCoordinates = (position, index, total) => {
    const yMap = {
      Goalkeeper: "10%",
      Defender: "32%",
      Midfielder: "53%",
      Attacker: "80%",
    };

    const y = yMap[position] || "50%";

    const spacing = 100 / (total + 1);
    const x = `${spacing * (index + 1)}%`;

    return { top: y, left: x };
  };

  const makeCaptain = async (player) => {
    try {
      const token = localStorage.getItem("token");
      const playerId = player.player?._id || player._id;
      const response = await fetch("/api/team/make-captain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId }),
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
      const playerId = player.player?._id || player._id;
      const response = await fetch("/api/team/substitute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ playerId }),
      });

      if (!response.ok) throw new Error("Failed to make substitute");

      console.log("Succes at doing sub");
      const updatedTeam = await response.json();
      setUserTeam(updatedTeam);
    } catch (error) {
      console.log("Not good");
    }
  };

  const fetchUserLeagues = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/league/my-leagues", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const leagues = await response.json();
      setUserLeagues(leagues);
    } catch (error) {
      console.error("Failed to fetch leagues:", error);
    }
  };

  const toggleCode = (leagueId) => {
    setShowCode((prev) => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }));
  };

  const saveTeam = () => {
    const positions = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Attacker: 0,
    };

    let count = 0;

    userTeam.players.forEach((p) => {
      if (!p.isSubstitute) {
        const pos = p.player.position;
        if (pos in positions) {
          positions[pos]++;
          count++;
        }
      }
    });

    if (
      positions.Goalkeeper < 1 ||
      positions.Defender < 3 ||
      positions.Midfielder < 3 ||
      positions.Attacker < 1 ||
      count < 11
    ) {
      alert(
        "Your team needs to have at least 11 players starting, and at least 1 Goalkeeper, 3 Defenders, 3 Midfielders and 1 Attacker!"
      );
    } else {
      navigate("/");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [teamResponse, pointsResponse] = await Promise.all([
          fetch("/api/team/my-team", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/fetchPoints", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const [teamData, pointsData] = await Promise.all([
          teamResponse.json(),
          pointsResponse.json(),
        ]);

        setUserTeam(teamData);
        setUserPoints(pointsData.gameweekPoints);
        setTotalPoints(pointsData.totalPoints);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
    fetchUserLeagues();
  }, []);

  return (
    <div className={styles.layoutContainer}>
      {userTeam ? (
        <div className={styles.accountList}>
          <h1>My Team</h1>
          <h2>
            GW points: {userPoints} Total points: {totalPoints}
          </h2>
          <button className={styles.saveTeam} onClick={() => saveTeam()}>
            Save team
          </button>
          <h2>Starters</h2>
          <div className={styles.pitchContainer}>
            <img src={pitch} className={styles.pitchImage} />
            {groupAndSortPlayers(
              userTeam.players.filter((p) => !p.isSubstitute)
            ).flatMap(([position, players], i) =>
              players.map((player, idx) => {
                const coordinates = getPlayerCoordinates(
                  position,
                  idx,
                  players.length
                );
                return (
                  <div
                    key={player._id}
                    className={styles.playerMarker}
                    style={{ top: coordinates.top, left: coordinates.left }}
                    onClick={() =>
                      setModalOpenForPlayer(
                        userTeam.players.find(
                          (p) => p.player._id === player.playerId
                        )
                      )
                    }
                  >
                    <img
                      src={getTeamLogo(player.teamName)}
                      className={styles.teamLogo}
                    />
                    {player.isCaptain ? (
                      <div className={styles.playerName}>
                        {getLastName(player.name)} (C)
                      </div>
                    ) : (
                      <div className={styles.playerName}>
                        {getLastName(player.name)}
                      </div>
                    )}
                    <div className={styles.playerPoints}>{player.points}</div>
                  </div>
                );
              })
            )}
          </div>
          <h2>Substitutes</h2>
          <div className={styles.subContainer}>
            {userTeam.players
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
                    {player.player.points}
                  </div>
                  <div>{player.player.position.substring(0, 3)}</div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <p>No team yet! Add players above.</p>
      )}
      {modalOpenForPlayer && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
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
            {!modalOpenForPlayer.isSubstitute && (
              <button
                onClick={() => {
                  makeCaptain(modalOpenForPlayer);

                  setModalOpenForPlayer(null);
                }}
                className={styles.modalButton}
              >
                Captain
              </button>
            )}

            <button
              onClick={() => {
                makeSubstitute(modalOpenForPlayer);
                setModalOpenForPlayer(null);
              }}
              className={styles.modalButton}
            >
              Sub
            </button>
            <button
              className={styles.closeBtn}
              onClick={() => setModalOpenForPlayer(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
      <div className={styles.leagueList}>
        <h1>Your Leagues</h1>
        {userLeagues.length === 0 ? (
          <p>You are not in any leagues yet.</p>
        ) : (
          <ul>
            {userLeagues.map((league) => (
              <li key={league._id} className={styles.leagueItem}>
                <div className={styles.leagueHeader}>
                  <strong>{league.name}</strong>
                  {userTeam?.owner === league.createdBy._id && (
                    <button
                      className={styles.saveTeam}
                      onClick={() => toggleCode(league._id)}
                    >
                      Code
                    </button>
                  )}
                </div>

                {showCode[league._id] && (
                  <div className={styles.leagueCode}>Code: {league.code}</div>
                )}

                <div className={styles.standings}>
                  <strong>Standings:</strong>
                  <ol>
                    {league.members.map((member, idx) => (
                      <li key={member.user._id || idx}>
                        {member.user?.username || "Unknown"} —{" "}
                        {member.team?.totalPoints ?? 0} pts
                      </li>
                    ))}
                  </ol>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Team;
