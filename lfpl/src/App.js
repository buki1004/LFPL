import React, { useEffect, useState } from "react";
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

const App = () => {

  const [backendData, setBackendData] = useState({ response: [] });
  const [query, setQuery] = useState("");
  const [userTeam, setUserTeam] = useState(null);
  const navigate = useNavigate();

  const addToTeam = async (player) => {
  try {
    const token = localStorage.getItem('token');

    const response = await fetch('/api/team/add-player', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        player: {
          id: player.player.id,
          name: player.player.name,
          position: player.statistics[0].games.position,
          price: player.player.price
        }
      })
    });

    const result = await response.text();
    if(!response.ok) {
      alert('Error: ' + JSON.parse(result).error);
      throw new Error(JSON.parse(result).error || 'Failed to add player ');
    }

    const updatedTeam = JSON.parse(result);
    setUserTeam(updatedTeam);
    console.log("Successfully added player to team!");
  } catch (error) {
    console.error("Failed to add player:", error);
  }
};

  const removeFromTeam = async(player) => {
    try { 
      const token = localStorage.getItem('token');

      const response = await fetch('/api/team/remove-player', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      },
        body: JSON.stringify({
          player: {
            _id: player._id,
            price: player.price
          }
        })
      });

      const result = await response.text();
      if(!response.ok) {
        alert('Error: ' + JSON.parse(result).error);
        throw new Error(JSON.parse(result).error || 'Failed to remove player ');
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
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed: ", error);
    }
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
      try {
        const response = await fetch('/api/team/my-team', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        setUserTeam(data);
      } catch(error) {
        console.error("Failed to fetch team:", error);
      }
    };

    if(localStorage.getItem('token')) {
      fetchTeam();
    }
  }, []);

  return ( 
    <div>
      <div className = "playerList">
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
              {entry.player.name} {entry.statistics[0].games.position} {entry.statistics[0].team.name} {entry.player.price}
              <button onClick={() => addToTeam(entry)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="accountList">
        <h1>My Team</h1>
        <button onClick={() => handleLogout()}>Logout</button>
        {userTeam ? (
          <div>
            <h2>Your budget: {userTeam.budget}</h2>
            <ul>
              {/* Add optional chaining and empty array fallback */}
              {(userTeam.players || []).map((player, index) => (
                <li key={player._id || index}>
                  {/* Handle both populated and unpopulated player references */}
                  {player.name || 'Unknown player'} 
                  {player.position && ` (${player.position})`}
                  <button onClick ={() => removeFromTeam(player)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>No team yet! Add players above.</p>
        )}
      </div>
    </div>
   );
}
 
export default App;
