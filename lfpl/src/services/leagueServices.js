export async function createLeague(
  newLeagueName,
  setNewLeagueName,
  setUserLeagues
) {
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
      fetchAndSetUserLeagues(setUserLeagues);
    }
  } catch (error) {
    console.error("League creation failed:", error);
  }
}

export async function joinLeague(joinCode, setJoinCode, setUserLeagues) {
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
      fetchAndSetUserLeagues(setUserLeagues);
    }
  } catch (error) {
    console.error("League join failed:", error);
  }
}

export async function fetchAndSetUserLeagues(setUserLeagues) {
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
}
