var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var propertyCategory = new schema({
    name: {
        type: String
    }
});
propertyCategory.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('propertycategory', propertyCategory);