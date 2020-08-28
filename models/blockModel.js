var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Block = new schema({
    block_to: {
        type:String
        // type: schema.Types.ObjectId,
        // ref: "user"
    },
    block_from: {
        type:String
    },
    
});
Block.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('block', Block);