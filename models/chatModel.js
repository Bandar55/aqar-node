var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Chat = new schema({
    sender_id: {
        type: String,
        default: ''
    },
    receiver_id: {
    	type: String
    },
    room_id: {
    	type: String
    },
    message: {
        type: String,
        default: ''
    },
    attachment: {
        type: String,
    },
    attachment_type: {
        type: String,
    },
    check_status: {
        type: String
    },
    delete_sender_id: {
        type: String
    },
    delete_both: {
        type: String
    }
});
Chat.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});

module.exports = mongoose.model('chat', Chat);