import React, { useEffect, useState } from "react";
import styles from "./Team.module.css";
import { useNavigate } from "react-router-dom";
import pitch from "./images/pitch.png";
import { makeCaptain, makeSubstitute } from "./services/teamServices";
import { fetchAndSetUserLeagues } from "./services/leagueServices";
import {
  getLastName,
  saveTeam,
  groupAndSortPlayers,
  getPlayerCoordinates,
  copyCode,
} from "./utils/teamUtils";

const Team = () => {
  const [userTeam, setUserTeam] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLeagues, setUserLeagues] = useState([]);
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
    fetchAndSetUserLeagues(setUserLeagues);
  }, []);

  return (
    <div className={styles.layoutContainer}>
      {userTeam ? (
        <div className={styles.accountList}>
          <h1>My Team</h1>
          <h2>
            GW points: {userPoints} Total points: {totalPoints}
          </h2>
          <button
            className={styles.saveTeam}
            onClick={() => saveTeam(userTeam, navigate)}
          >
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
                    {player.player.gameweekPoints}
                  </div>
                  <div>{player.player.position.substring(0, 3)}</div>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className={styles.accountList}>
          <h1>My Team</h1>
          <h2>
            GW points: {userPoints} Total points: {totalPoints}
          </h2>
          <button className={styles.saveTeam}>Save team</button>
          <h2>Starters</h2>
          <div className={styles.pitchContainer}>
            <img src={pitch} className={styles.pitchImage} />
            {[...Array(11)].map((_, i) => (
              <div
                key={i}
                className={`${styles.playerMarker} ${styles.loadingCard}`}
                style={{ top: "50%", left: "50%" }}
              >
                Loading...
              </div>
            ))}
          </div>
        </div>
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
            <p>
              GW points:{" "}
              {modalOpenForPlayer.player?.gameweekPoints ||
                modalOpenForPlayer.gameweekPoints}{" "}
              Total points:{" "}
              {modalOpenForPlayer.player?.totalPoints ||
                modalOpenForPlayer.totalPoints}
            </p>
            {!modalOpenForPlayer.isSubstitute && (
              <button
                onClick={() => {
                  makeCaptain(modalOpenForPlayer, setUserTeam);

                  setModalOpenForPlayer(null);
                }}
                className={styles.modalButton}
              >
                Captain
              </button>
            )}

            <button
              onClick={() => {
                makeSubstitute(modalOpenForPlayer, setUserTeam);
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
                      onClick={() => copyCode(league._id)}
                    >
                      Code
                    </button>
                  )}
                </div>

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
