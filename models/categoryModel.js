var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Category = new schema({
    name: {
        type:String
    }
});
Category.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('category', Category);