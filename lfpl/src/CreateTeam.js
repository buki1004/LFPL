import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

const CreateTeam = () => {
  const [backendData, setBackendData] = useState({ response: [] });
  const [query, setQuery] = useState("");
  const [userTeam, setUserTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setAuthChecked(true);
    }
  }, [navigate]);

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
    if (userTeam?.players?.length >= 15) {
      navigate("/");
    } else {
      alert(
        `You need ${
          15 - (userTeam?.players?.length || 0)
        } more players to complete your team!`
      );
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

        {isLoading ? (
          <p>Loading team data...</p>
        ) : userTeam ? (
          <div>
            <h2>Your budget: {(userTeam.budget / 100).toFixed(1)}</h2>
            <button onClick={() => saveTeam()}>Save team</button>

            {userTeam.players.length > 0 ? (
              groupAndSortPlayers(userTeam.players).map(
                ([position, players]) => (
                  <div key={position}>
                    <h3>
                      {position}s ({players.length})
                    </h3>
                    <ul>
                      {players.map((player) => (
                        <li key={player._id}>
                          {player.name} ({(player.price / 100).toFixed(1)})
                          <button onClick={() => removeFromTeam(player)}>
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              )
            ) : (
              <p>No players in your team yet</p>
            )}
          </div>
        ) : (
          <p>Unable to load team data</p>
        )}
      </div>
    </div>
  );
};

export default CreateTeam;
