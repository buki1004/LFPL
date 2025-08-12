import React, { useEffect, useState } from "react";
import styles from "./League.module.css";
import { useNavigate } from "react-router-dom";
import {
  createLeague,
  joinLeague,
  fetchAndSetUserLeagues,
} from "./services/leagueServices";
import { copyCode } from "./utils/teamUtils";

const League = () => {
  const [userTeam, setUserTeam] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLeagues, setUserLeagues] = useState([]);
  const [newLeagueName, setNewLeagueName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();

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
    fetchAndSetUserLeagues(setUserLeagues);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.leagueActions}>
        <h2>Create a League</h2>
        <input
          type="text"
          placeholder="League name"
          value={newLeagueName}
          onChange={(e) => setNewLeagueName(e.target.value)}
          className={styles.leagueInput}
        />
        <button
          onClick={() =>
            createLeague(newLeagueName, setNewLeagueName, setUserLeagues)
          }
          className={styles.leagueBtn}
        >
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
        <button
          onClick={() => joinLeague(joinCode, setJoinCode, setUserLeagues)}
          className={styles.leagueBtn}
        >
          Join
        </button>
      </div>
      <div className={styles.leagueList}>
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
