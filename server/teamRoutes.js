const express = require('express');
const router = express.Router();
const Team = require('./models/Team');
const auth = require('./auth');
const Player = require('./models/Player');

router.get('/my-team', auth, async (req, res) => {
    try {
        const team = await Team.findOne({ owner: req.user._id })
        .populate('players')
        .exec();
        res.json(team);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/add-player', auth, async (req, res) => {
    try {
        console.log('Authenticated user ID: ', req.user._id);

        const { player } = req.body;

        const playerDoc = await Player.findOneAndUpdate(
            { id: player.id },
            { $set: player },
            { upsert: true, new: true}
        );  

        const team = await Team.findOneAndUpdate(
            { owner: req.user._id }, 
            { $addToSet: { players: playerDoc._id } },
            { new: true }
        ).populate('players');

        if (!team) return res.status(404).json({ error: 'Team not found '});

        /*team.players.push(req.body.playerId);
        await team.save();

        const updatedTeam = await Team.findById(team._id).populate('players');*/
        res.json(team); 
    } catch(error) {
        console.error('Server error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;