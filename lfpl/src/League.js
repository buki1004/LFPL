import React, { useEffect, useState } from "react";
import styles from "./League.module.css";
import { useNavigate } from "react-router-dom";

const League = () => {
  const [userTeam, setUserTeam] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLeagues, setUserLeagues] = useState([]);
  const [newLeagueName, setNewLeagueName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [showCode, setShowCode] = useState({});
  const navigate = useNavigate();

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

  const handleCreateLeague = async () => {
    if (!newLeagueName) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/league/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newLeagueName }),
      });

      if (response.ok) {
        setNewLeagueName("");
        fetchUserLeagues();
      }
    } catch (error) {
      console.error("League creation failed:", error);
    }
  };

  const handleJoinLeague = async () => {
    if (!joinCode) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/league/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });

      if (response.ok) {
        setJoinCode("");
        fetchUserLeagues();
      }
    } catch (error) {
      console.error("League join failed:", error);
    }
  };

  const toggleCode = (leagueId) => {
    setShowCode((prev) => ({
      ...prev,
      [leagueId]: !prev[leagueId],
    }));
  };

  const copyCode = (s) => {
    navigator.clipboard.writeText(s);
    alert("League code copied to clipboard!");
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
        setTotalPoints(pointsData.totalPoints);
      } catch (error) {
        console.error("Fetch failed:", error);
      }
    };

    fetchData();
    fetchUserLeagues();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <h2>Create a League</h2>
        <input
          type="text"
          placeholder="League name"
          value={newLeagueName}
          onChange={(e) => setNewLeagueName(e.target.value)}
          className={styles.leagueInput}
        />
        <button onClick={handleCreateLeague} className={styles.leagueBtn}>
          Create
        </button>

        <h2>Join a League</h2>
        <input
          type="text"
          placeholder="Join code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          className={styles.leagueInput}
        />
        <button onClick={handleJoinLeague} className={styles.leagueBtn}>
          Join
        </button>
      </div>
      <div className={styles.right}>
        <h2>Your Leagues</h2>
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
                      className={styles.leagueBtn}
                      onClick={() => copyCode(league.code)}
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

export default League;
