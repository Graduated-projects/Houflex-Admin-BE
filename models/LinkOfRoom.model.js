const mongoose = require('mongoose')

const LinkOfRoomSchema = mongoose.Schema({
    link: [{
        type: String,
        required: true
    }],
    page: {
        type: Number,
        required: true,
        
    }
})

module.exports = mongoose.model('LinkOfRoom', LinkOfRoomSchema)