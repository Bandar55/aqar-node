var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var Query = new schema({
    userId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    reply: {
        type: String,
        default: ''
    },
     Type: {
        type: String,
        default: 'Admin'
    }
});
Query.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('query', Query);