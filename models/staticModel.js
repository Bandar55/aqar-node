var mongoose = require('mongoose');
var schema = mongoose.Schema 
var timestamps = require('mongoose-timestamp');

var static_content = new schema({
    title: {
        type: String
    },
    description: {
        type: String
    },
    contentType: {
        type: String
    }
});

static_content.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});

module.exports = mongoose.model('static_content', static_content);
