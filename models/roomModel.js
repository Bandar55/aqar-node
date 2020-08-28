var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Room = new schema({
    sender_id: {
        type: String
    },
    receiver_id: {
    	// type: String
        type: schema.Types.ObjectId,
        ref: "user",
    },
    room_id: {
    	type: String
    },
    blockroom_id: {
        type: String
    },
    lastmessage: {
        type: String
    },
    property_id: {
        type: String
    },
    title: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
});
Room.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});

module.exports = mongoose.model('room', Room);