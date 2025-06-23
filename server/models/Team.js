const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, default: "My team" },
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Team', teamSchema);