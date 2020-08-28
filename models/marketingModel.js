var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Marketing = new schema({
	screenName: {
		type: String
	},
    title: {
        type: String
    },
    bannerImage: {
        type: String
    },
});
Marketing.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('marketing', Marketing);