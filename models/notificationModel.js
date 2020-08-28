var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Notification = new schema({
    userId: {
        type: String
    },
    notificationSender: {
        type: String,
    },
    notificationReceiver: {
        type: String,
    },
    profUserId: {
        type: String,
        default: ''
    },
    propOrUserType: {
        type: String,
        default: ''
    },
    propOrRoomOrUserId: {
        type: String
    },
    title: {
        type: String,
    }, 
    message:{
       type: String,
    },
    notificationType: {
        type: String,
    },
    propertyTitle: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
});
Notification.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});

module.exports = mongoose.model('notification', Notification);