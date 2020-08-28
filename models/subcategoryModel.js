var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Subcategory = new schema({
    name: {
        type:String
    },
    categoryId: { 
        type: schema.Types.ObjectId, 
        ref: "category" 
    },
});
Subcategory.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('subcategory', Subcategory);