const express = require('express');
const router = express.Router();
const auth = require('./auth')
const User = require('./models/User');
const Player = require('./models/Player');
const Team = require('./models/Team');

router.post('/pointsTest', auth, async (req, res) => {
    try {
        const allPlayers = await Player.find({});
        const update = allPlayers.map(player => ({
            updateOne: {
                filter: {_id: player._id },
                update: { $set: { points: Math.floor(Math.random() * 10) } }
            }
        }));

        await Player.bulkWrite(update);

        const allTeams = await Team.find().populate('players');
        const teamUpdates = allTeams.map(team => {
            const totalPoints = team.players.reduce((sum, player) => sum + (player.points || 0), 0);
            return {
                updateOne: {
                    filter: {_id: team._id },
                    update: { $set: { points: totalPoints } }
                }
            };
        });

        await Team.bulkWrite(teamUpdates);

        const userTeam = await Team.findOne({ owner: req.user._id });
        res.json(userTeam.points);
    } catch (error) {
        console.error("Points simulation error: ", error);
        res.status(500).json(0);
    }
});

router.post('/fetchPoints', auth, async (req, res) => {
    try {
        const team = await Team.findOne({ owner: req.user._id});
        const points = team.points;
        res.json(points);
    } catch (error) {
        console.error("Error fetching points: ", error);
        res.status(500).json(0);
    }
});

module.exports = router;