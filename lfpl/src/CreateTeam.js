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

const CreateTeam = () => {
  const [backendData, setBackendData] = useState([]);
  const [query, setQuery] = useState("");
  const [userTeam, setUserTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
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
    return logos[teamName] || sans;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

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
    if (!authChecked) return;

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        setIsLoading(true);
        const response = await fetch("/api/team/my-team", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(await response.text());

        const teamData = await response.json();
        setUserTeam(teamData);
      } catch (error) {
        console.error("Fetch failed:", error);
        if (error.message.includes("401")) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [authChecked, navigate]);

  return (
    <div className={styles.layoutContainer}>
      <div className={styles.accountList}>
        <h1>My Team</h1>
        {userTeam ? (
          <div>
            <h2>
              Your budget: {parseFloat((userTeam.budget / 100).toFixed(2))}
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
      </div>
      <div className={styles.playerList}>
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
                (p) => p.player?.id == player.id
              );

              return (
                <div
                  key={player._id}
                  className={`${styles.playerCard} ${
                    isInTeam ? styles.disabledCard : ""
                  }`}
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
                    onClick={() => addToTeam(player, setUserTeam)}
                  >
                    +
                  </button>
                </div>
              );
            })}
        </div>
      </div>
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

export default CreateTeam;
