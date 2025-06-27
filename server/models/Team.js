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
    },
    budget: { type: Number, default: 10000},
    points: {type: Number, default: 0}
});

module.exports = mongoose.model('Team', teamSchema);