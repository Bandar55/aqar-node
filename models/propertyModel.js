var mongoose = require('mongoose');
var schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var timestamps = require('mongoose-timestamp');
var Property = new schema({
    Type: {
        type: String
    },
    status: {
        type: String,
        // default: "active"
    },
    propertyId: {
        type: String
    },
    userId: {
        type: schema.Types.ObjectId,
        ref: "user"
    },
    professionalUserId: {
        type: schema.Types.ObjectId,
        ref: "user",
    },
    counter: {
        type:Number,
    },
    title: {
        type:String
    },
    category: {
        type: String
    },
    purpose: {
        type: String
    },
    available: {
        type: String
    },   
    bedrooms: {
        type: String
    },
    bathrooms: {
        type: String
    },
    kitchens: {
        type: String
    },
    floor: {
        type: String
    },
    builtSize: {
        type: String
    },
    builtSizeUnit: {
        type: String
    },
    plotSize: {
        type: String
    },
    plotSizeUnit: {
        type: String
    },
    length: {
        type: String
    },
    lengthUnit: {
        type: String
    },
    width: {
        type: String
    },
    widthUnit: {
        type: String
    },
    yearBuilt: {
        type: String
    },
    streetView: {
        type: String  
    },
    streetWidth: {
        type: String  
    },
    streetWidthUnit: {
        type: String  
    },
    description: {
        type: String
    },
    extrabuildingNo: {
        type: String
    }, 
    extrashowroomNo: {
        type: String
    }, 
    revenue: {
        type: String
    }, 
    rentTime: {
        type: String,
        default: ''
    },
    totalPriceRent: {
        type: String
    },
    totalPriceSale: {
        type: String
    },
    totalPrice: {
        type: String
    },
    defaultDailyPrice: {
        type: String
    },
    defaultWeeklyPrice: {
        type: String
    },
    defaultMonthlyPrice: {
        type: String
    },
    defaultyearlyPrice: {
        type: String
    },
    balcony: {
        type: Boolean
    },
    garden: {
        type: Boolean
    },
    parking: {
        type: Boolean
    },
    modularKitchen: {
        type: Boolean
    },
    store: {
        type: Boolean
    },
    lift: {
        type: Boolean
    },
    duplex: {
        type: Boolean
    },
    furnished: {
        type: Boolean
    },
    aircondition: {
        type: Boolean
    },
    imagesFile: [{
        image: {
            type: String
        },
        imageCaption: {
            type: String
        }
    }],
    videosFile: [{
        video: {
            type: String
        },
        videoCaption: {
            type: String
        }
    }],
    indoor: {
        type: String
    },
    outdoor: {
        type: String
    },
    furnish: {
        type: String
    },
    parkingOption: {
        type: String
    },
    views: {
        type: String
    },
    sizem2: {
        type: String
    },
    pricePerMeter: {
        type: String
    },
    country: {
        type: String
    },
    state: {
        type: String
    },
    city: {
        type: String
    },
    area: {
        type: String
    },
    zipcode: {
        type:String
    },
    address: {
        type: String
    },
    apartmentNo: {
        type: String
    },
    buildingNo: {
        type: String
    },
    location: {       
        coordinates: [{
          type: Number,
        }],
        type: { type: String, default: 'Point', enum: ['Point'] },
    },
    lat: {
        type: String
    },
    long: {
        type: String
    },
    likeUserId:[{
        userId:{
            type:String
        }
    }],
    remainingDays: {
        type: String
    },
    totalDays: {
        type: String,
        default: "90"
    },
    currency: {
        type: String
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
});
Property.plugin(mongoosePaginate);
Property.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});
Property.index({ "location" : "2dsphere" })
module.exports = mongoose.model('property', Property)