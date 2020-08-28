var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var AdminChat = new schema({
    sender_id: {
        type: String
    },
    reason: {
        type: String
    },
    details: {
        type: String
    }
});
AdminChat.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});

module.exports = mongoose.model('adminchat', AdminChat);