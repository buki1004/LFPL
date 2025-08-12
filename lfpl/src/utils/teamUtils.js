export const getLastName = (name) => {
  const lastName = name.split(" ").pop();
  return lastName;
};

export const saveTeam = (userTeam, navigate) => {
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

export const groupAndSortPlayers = (players = []) => {
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

export const getPlayerCoordinates = (position, index, total) => {
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

export const copyCode = (s) => {
  navigator.clipboard.writeText(s);
  alert("League code copied to clipboard!");
};
