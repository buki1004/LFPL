import React, { useEffect, useState } from "react";
import "./App.css";
import { useNavigate } from "react-router-dom";

const Team = () => {
  const [backendData, setBackendData] = useState({ response: [] });
  const [userTeam, setUserTeam] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [modalOpenForPlayer, setModalOpenForPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);

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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      setAuthChecked(true);
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
        setUserPoints(pointsData);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="accountList">
      <h1>My Team</h1>
      {userTeam ? (
        <div>
          <h2>Your points: {userPoints}</h2>
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
                        {player.points * 2}
                      </strong>
                    ) : (
                      <>
                        {player.name} ({(player.price / 100).toFixed(1)}){" "}
                        {player.points}
                      </>
                    )}
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
              <ul>
                {players.map((player) => (
                  <li key={player._id}>
                    <button onClick={() => setModalOpenForPlayer(player._id)}>
                      Click Me
                    </button>
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
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>No team yet! Add players above.</p>
      )}
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

export default Team;
