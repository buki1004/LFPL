export async function makeCaptain(playerEntry, setUserTeam) {
  try {
    const token = localStorage.getItem("token");

    const playerData = playerEntry.player || playerEntry;
    const playerId = playerData._id;
    const response = await fetch("/api/team/make-captain", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) throw new Error("Failed to set captain");

    const updatedTeam = await response.json();
    setUserTeam(updatedTeam);
  } catch (error) {
    console.log("Error");
  }
}

export async function makeSubstitute(playerEntry, setUserTeam) {
  try {
    const token = localStorage.getItem("token");

    const playerData = playerEntry.player || playerEntry;
    const playerId = playerData._id;
    const response = await fetch("/api/team/substitute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) throw new Error("Failed to make substitute");

    console.log("Succes at doing sub");
    const updatedTeam = await response.json();
    setUserTeam(updatedTeam);
  } catch (error) {
    console.log("Not good");
  }
}
