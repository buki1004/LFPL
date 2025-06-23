const express = require('express')
const mongoose = require('mongoose');
const authRoutes = require('./authRoutes');
const teamRoutes = require('./teamRoutes');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { json } = require('stream/consumers');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/fpl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.log(err));

require('./models/User');
require('./models/Player');
require('./models/Team')

app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);



function randomPrice(min, max){
    const randomInt = Math.floor(Math.random() * ((max * 10) - (min * 10) +1)) + (min * 10);
    return randomInt / 10;
  }

function setPlayerPrices1(players){
    return players.map(player => {
        if (!player.player.price){
            if (player.statistics[0].games.position === "Goalkeeper"){
                const price = player.statistics[0].goals.saves*0.02 + 4;
                player.player.price = Math.round(price*10)/10;
            }
            else if (player.statistics[0].games.position === "Defender"){
                const price = player.statistics[0].tackles.interceptions*0.05 + 4;
                player.player.price = Math.round(price*10)/10;
            }
            else if (player.statistics[0].games.position === "Midfielder"){
                const price = player.statistics[0].goals.total*0.1 + player.statistics[0].goals.assists*0.05 + player.statistics[0].passes.key*0.02 + 4;
                player.player.price = Math.round(price*10)/10;
            }
            else if (player.statistics[0].games.position === "Attacker"){
                const price = player.statistics[0].goals.total*0.2 + player.statistics[0].goals.assists*0.1 + 4;
                player.player.price = Math.round(price*10)/10;
            }
            return player;
        }
        return player;
    })
}

app.get("/api", (req, res) =>{
    const filePath = path.join(__dirname, "allPlayers.json");
    fs.readFile(filePath, "utf8", (err, data) => {
        if(err){
            return res.status(500).json({ error: "Failed to read JSON file" });
        }
    
    try {
        const jsonData = JSON.parse(data);
        const players = jsonData.response || [];
        const processedPlayers = setPlayerPrices1(players);
        const { name } = req.query;
        let filteredPlayers = processedPlayers.filter(player => {
            if((name && !player.player.firstname.toLowerCase().includes(name.toLowerCase())) && 
            (name && !player.player.lastname.toLowerCase().includes(name.toLowerCase())) && 
            (name && !player.statistics[0].team.name.toLowerCase().includes(name.toLowerCase()))) 
                return false;
            else
                return true;
        });

        const sortedPlayers =   [...filteredPlayers].sort((a,b) => b.player.price - a.player.price);

        res.json( { response: sortedPlayers });
    } catch (parseError) {
        res.status(500).json({ error: "Invalid JSON format" });
    }
});
});

app.listen(5000, () => { console.log("Server started on port 5000") })