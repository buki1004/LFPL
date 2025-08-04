import { useState, useEffect } from "react";
import styles from "./Transfer.module.css";
import { useNavigate } from "react-router-dom";
import pitch from "./images/pitch.png";
import sans from "./images/sans.png";

const Transfers = () => {
  const [backendData, setBackendData] = useState({ response: [] });
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

  const getLastName = (x) => {
    const lastName = x.split(" ").pop();
    return lastName;
  };

  const addToTeam = async (player) => {
    try {
      const token = localStorage.getItem("token");
      const roundedPrice = Math.round(player.player.price * 100);

      const response = await fetch("/api/team/add-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          player: {
            id: player.player.id,
            name: player.player.name,
            position: player.statistics[0].games.position,
            price: roundedPrice,
            teamName: player.statistics[0].team.name,
          },
        }),
      });

      const result = await response.text();
      if (!response.ok) {
        alert("Error: " + JSON.parse(result).error);
        throw new Error(JSON.parse(result).error || "Failed to add player ");
      }

      const updatedTeam = JSON.parse(result);
      setUserTeam(updatedTeam);
      console.log("Successfully added player to team!");
    } catch (error) {
      console.error("Failed to add player:", error);
    }
  };

  const removeFromTeam = async (player) => {
    try {
      const token = localStorage.getItem("token");
      const playerId = player.player?._id || player._id;
      const playerPrice = player.player?.price || player.price;

      const response = await fetch("/api/team/remove-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          player: {
            _id: playerId,
            price: playerPrice,
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

  const saveTeam = () => {
    const positions = {
      Goalkeeper: 0,
      Defender: 0,
      Midfielder: 0,
      Attacker: 0,
    };

    userTeam.players.forEach((p) => {
      const pos = p.player.position;
      if (pos in positions) {
        positions[pos]++;
      }
    });

    console.log(positions);

    if (
      positions.Goalkeeper < 2 ||
      positions.Defender < 5 ||
      positions.Midfielder < 5 ||
      positions.Attacker < 3
    ) {
      alert(
        "Your team needs to have 2 Goalkeepers, 5 Defenders, 5 Midfielders and 3 Attackers"
      );
    } else navigate("/");
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

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(`/api?name=${query}`);
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
      <div className={styles.accountList}>
        <h1>My Team</h1>
        {userTeam ? (
          <div>
            <h2>
              Your budget: {parseFloat((userTeam.budget / 100).toFixed(2))}
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
          {backendData.response
            .filter((entry) => {
              const position = entry.statistics[0].games.position;
              return (
                selectedPosition === "All Positions" ||
                position === selectedPosition
              );
            })
            .map((entry, index) => {
              const player = entry.player;
              const stats = entry.statistics[0];
              const isInTeam = userTeam?.players?.some(
                (p) => p.player?.id == player.id
              );

              return (
                <div
                  key={index}
                  className={`${styles.playerCard} ${
                    isInTeam ? styles.disabledCard : ""
                  }`}
                >
                  <div className={styles.playerInfo}>
                    <img
                      src={getTeamLogo(stats.team.name)}
                      className={styles.clubLogo}
                    />
                    <strong>{player.name}</strong>
                    <div className={styles.playerMeta}>
                      {stats.games.position} • {stats.team.name} • £
                      {player.price}
                    </div>
                  </div>
                  <button
                    className={styles.addButton}
                    onClick={() => addToTeam(entry)}
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
                  removeFromTeam(modalOpenForPlayer);

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
