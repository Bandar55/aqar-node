var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Report = new schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    reason: {
        type:String
    },
    details: {
        type:String
    },
    Type: {
        type: String,
        default: 'User'
    }
});
Report.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('report', Report);