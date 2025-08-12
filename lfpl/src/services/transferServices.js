export async function addToTeam(playerEntry, setUserTeam) {
  try {
    const token = localStorage.getItem("token");

    const playerData = playerEntry.player || playerEntry;
    const stats = playerEntry.statistics?.[0] || {};

    const roundedPrice = Math.round(playerData.price * 100);

    const response = await fetch("/api/team/add-player", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        player: {
          id: playerData.id,
          name: playerData.name,
          position: stats.games?.position,
          price: roundedPrice,
          teamName: stats.team?.name,
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
}

export async function removeFromTeam(playerEntry, setUserTeam) {
  try {
    const token = localStorage.getItem("token");

    const playerData = playerEntry.player || playerEntry;

    const playerId = playerData._id;
    const playerPrice = playerData.price;

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
}
