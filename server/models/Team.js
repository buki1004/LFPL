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
    budget: { type: Number, default: 100}
});

module.exports = mongoose.model('Team', teamSchema);