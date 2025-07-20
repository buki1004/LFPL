import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Transfers = () => {
  const [backendData, setBackendData] = useState({ response: [] });
  const [query, setQuery] = useState("");
  const [userTeam, setUserTeam] = useState(null);
  const navigate = useNavigate();

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
    <div>
      <div className="playerList">
        <h1>Player List</h1>
        <p>Search players by name or club</p>
        <input
          type="text"
          placeholder="Search..."
          className="search"
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul className="list">
          {backendData.response.map((entry, index) => (
            <li key={index} className="listItem">
              {entry.player.name} {entry.statistics[0].games.position}{" "}
              {entry.statistics[0].team.name} {entry.player.price}
              <button onClick={() => addToTeam(entry)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="accountList">
        <h1>My Team</h1>
        {userTeam ? (
          <div>
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
                      {player.isCaptain ? (
                        <strong>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.points * 2}
                        </strong>
                      ) : (
                        <>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.points}
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
                      {player.isCaptain ? (
                        <strong>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.points}
                        </strong>
                      ) : (
                        <>
                          {player.name} ({(player.price / 100).toFixed(1)}){" "}
                          {player.points}
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
    </div>
  );
};

export default Transfers;
