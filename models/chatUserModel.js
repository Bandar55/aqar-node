var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var chatUser = new schema({
    property_id: {
        type: String
    },
    sender_id: {
        type: String
    },
    room_id: {
        type: String
    },
    receiver_id: {
        type: schema.Types.ObjectId,
        ref: "user",
    	// type: String
    }
});
chatUser.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('chatuser', chatUser);