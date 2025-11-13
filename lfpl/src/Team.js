import React, { useEffect, useState } from "react";
import styles from "./Team.module.css";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
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
  const [viewingOther, setViewingOther] = useState(false);
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

  const viewOtherTeam = async (otherUserId) => {
    const token = localStorage.getItem("token");
    let currentUserId = null;
    if (!token) {
      navigate("/login");
      return;
    }

    const decoded = jwtDecode(token);
    currentUserId = decoded._id;

    console.log("Fetching for:", otherUserId);
    try {
      const res = await fetch(`/api/team/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error(`Failed to fetch team: ${res.status}`);

      const teamData = await res.json();
      setUserTeam(teamData);
      setUserPoints(teamData.gameweekPoints ?? 0);
      setTotalPoints(teamData.totalPoints ?? 0);
      setViewingOther(teamData.owner._id !== currentUserId);
    } catch (error) {
      console.error("Failed to fetch other user team:", error);
    }
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
          <h1>{userTeam.owner.username}'s team</h1>
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
                    style={{
                      top: coordinates.top,
                      left: coordinates.left,
                      cursor: viewingOther ? "default" : "pointer",
                    }}
                    onClick={() =>
                      !viewingOther &&
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
                  onClick={() => !viewingOther && setModalOpenForPlayer(player)}
                  style={{ cursor: viewingOther ? "default" : "pointer" }}
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
            <p>{modalOpenForPlayer.player.name}'s season statistics:</p>
            <div className={styles.stats}>
              {renderPlayerStats(modalOpenForPlayer.player)}
            </div>
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
                  {userTeam?.owner._id === league.createdBy._id && (
                    <button
                      className={styles.saveTeam}
                      onClick={() => copyCode(league._id)}
                      style={{
                        visibility: viewingOther ? "hidden" : "visible",
                      }}
                    >
                      Code
                    </button>
                  )}
                </div>

                <div className={styles.standings}>
                  <strong>Standings:</strong>
                  <ol>
                    {league.members.map((member, idx) => (
                      <li
                        key={member.user._id || idx}
                        style={{
                          cursor: "pointer",
                        }}
                        onClick={() => viewOtherTeam(member.user._id)}
                      >
                        {member.team?.name || "Unknown"} —{" "}
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
