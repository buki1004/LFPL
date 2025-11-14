import { useState, useEffect } from "react";
import styles from "./Transfer.module.css";
import { useNavigate } from "react-router-dom";
import pitch from "./images/pitch.png";
import sans from "./images/sans.png";
import { addToTeam, removeFromTeam } from "./services/transferServices";
import {
  getLastName,
  saveTeam,
  groupAndSortPlayers,
  getPlayerCoordinates,
} from "./utils/teamUtils";

const Transfers = () => {
  const [backendData, setBackendData] = useState([]);
  const [query, setQuery] = useState("");
  const [userTeam, setUserTeam] = useState(null);
  const [modalOpenForPlayer, setModalOpenForPlayer] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState("All Positions");
  const positions = [
    "All Positions",
    "Goalkeeper",
    "Defender",
    "Midfielder",
    "Attacker",
  ];
  const [isDropDownOpen, setIsDropDownOpen] = useState(false);
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
    return logos[teamName] || sans;
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
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api/players?name=${query}`);
        const data = await response.json();
        setBackendData(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchPlayers();
  }, [query]);

  useEffect(() => {
    const fetchTeam = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch("/api/team/my-team", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setUserTeam(data);
      } catch (error) {
        console.error("Error when fetching team:", error);
      }
    };

    fetchTeam();
  }, []);

  return (
    <div className={styles.layoutContainer}>
      {userTeam ? (
        <div className={styles.accountList}>
          <h1>My Team</h1>
          <div className={styles.pointsBar}>
            <div className={styles.pointsBox}>
              <span className={styles.pointsLabel}>Budget</span>
              <span className={styles.pointsValue}>
                {parseFloat((userTeam.budget / 100).toFixed(2)) || "0"}
              </span>
            </div>
          </div>
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
          <h2>Loading...</h2>
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
          <h2>Substitutes</h2>
          <div className={styles.subContainer}>
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`${styles.subCard} ${styles.loadingCard}`}
              >
                Loading...
              </div>
            ))}
          </div>
        </div>
      )}
      <div className={styles.playerList}>
        <div className={styles.listContainer}>
          <h1>Player List</h1>
          <p>Search players by name or club</p>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className={styles.dropdown}>
            <div
              className={styles.dropdownHeader}
              onClick={() => setIsDropDownOpen(!isDropDownOpen)}
            >
              {selectedPosition} ▾
            </div>
            {isDropDownOpen && (
              <div className={styles.dropdownList}>
                {positions.map((pos) => (
                  <div
                    key={pos}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedPosition(pos);
                      setIsDropDownOpen(false);
                    }}
                  >
                    {pos}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className={styles.playerCardList}>
            {backendData
              .filter((player) => {
                const position = player.position || "Unknown";
                return (
                  selectedPosition === "All Positions" ||
                  position === selectedPosition
                );
              })
              .map((player) => {
                const position = player.position || "Unknown";
                const isInTeam = userTeam?.players?.some(
                  (p) => p.player?.id === player.id
                );

                return (
                  <div
                    key={player._id}
                    className={`${styles.playerCard} ${
                      isInTeam ? styles.disabledCard : ""
                    }`}
                    onClick={() => setModalOpenForPlayer(player)}
                  >
                    <div className={styles.playerInfo}>
                      <img
                        src={getTeamLogo(player.teamName)}
                        className={styles.clubLogo}
                      />
                      <strong>{player.name}</strong>
                      <div className={styles.playerMeta}>
                        {position} • {player.teamName} • £
                        {(player.price / 100).toFixed(1)} • {player.totalPoints}
                      </div>
                    </div>
                    <button
                      className={styles.addButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToTeam(player, setUserTeam);
                      }}
                    >
                      +
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
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
            {modalOpenForPlayer && (
              <button
                onClick={() => {
                  removeFromTeam(modalOpenForPlayer, setUserTeam);

                  setModalOpenForPlayer(null);
                }}
                className={styles.modalButton}
              >
                Remove
              </button>
            )}
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

export default Transfers;
