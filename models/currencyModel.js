var mongoose = require('mongoose');
var schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');

var Currency = new schema({
    countryName: {
        type:String
    },
    countryCode: {
        type:String
    },
    currencyType: {
        type:String
    },
    currencyRate: {
        type:String
    }
});
Currency.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
module.exports = mongoose.model('currency', Currency);