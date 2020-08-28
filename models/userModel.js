var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');
var User = mongoose.Schema({
    userId: {
        type: String
    },
    jwtToken: {
        type: String
    },
    deviceType: {
        type: String
    },
    deviceToken: {
        type: String
    },
    status:{
        type:String,
        default: 'active'
    },
    Type:{
        type: String,
        enum: ['normal', 'business', 'professional'],
        default: 'normal'
    },
    counter: {
        type:Number,
    },
    countryCode:{
        type: String
    },
    mobileNumber:{
        type:String
    },
    memberSince: {
        type: String,
        default: ''
    },
    fullName:{
        type:String,
        default: ""
    },
    category: {
        type:String
    },
    categoryId: {
        type:String
    },
    subCategory: {
        type:String
    },
    gender: {
        type:String
    },
    birthDate: {
        type:String
    },
    email: {
        type:String,
        default: ""
    },
    country: {
        type:String,
        default: ''
    }, 
    currency: {
        type: String,
        default: ''
    }, 
    measurement: {
        type: String,
        default: ''
    },
    appLanguage: {
        type: String,
        default: ''
    }, 
    speakLanguage: {
        type: String,
        default: ''
    },
    termsCondition: {
        type: Boolean,
        default:false
    },
    professionalId: {
        type: String
    }, 
    businessId: {
        type: String
    }, 
    profileId: {
        type: String
    }, 
    professionalProfile: {
        type: Boolean,
        default: false
    },
    businessProfile: {
        type: Boolean,
        default: false
    },
    professional_id: {
        type: String,
        default: ""
    },
    business_id: {
        type: String,
        default: ""
    },
    profileImage: {
        type: String,
        default: ""
    },
    imagesFile: [{
        image: {
            type: String
        }
    }],
    videosFile: [{
        video: {
            type: String
        }
    }],
    state: {
        type: String
    },
    city: {
        type: String
    },
    zipcode: {
        type: String
    },
    area: {
        type: String
    },
    website: {
        type: String,
        default: ''
    },
    govtIdType1: {
        type: String,
        default: ''
    },
    govtIdNumber1: {
        type: String,
        default: ''
    },
    govtIdImage1: {
        type: String,
        default: ''
    },     
    govtIdType2: {
        type: String,
        default: ''
    },
    govtIdNumber2: {
        type: String,
        default: ''
    },
    govtIdImage2: {
        type: String,
        default: ''
    },
    facebookUrl: {
        type: String,
        default: ''
    },
    googleplusUrl: {
        type:String,
        default: ''
    },
    twitterUrl: {
        type:String,
        default: ''
    },
    snapchatUrl: {
        type:String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    },
    projectAchieved: {
        type: String,
        default: ''
    },
    specialities: {
        type: String,
        default: ''
    },
    areaCovered: {
        type: String,
        default: ''
    },
    location: {
        type: String
    },
    locat: {       
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
    rating: {
        type: String
    },
    remainingDays: {
        type: String
    },
    totalDays: {
        type: String,
        default: "120"
    },
    likeUserId:[{
        userId:{
            type:String
        }
    }],
    notification: {
        type: Boolean,
        default: true
    },
    room_id: {
        type: String,
        default: ''
    },
    blockroom_id: {
        tye: String
    },
    createdAt:{
        type:Date,
        default:new Date()
    }
})

User.plugin(timestamps,{
    createdAt: 'created',
    updatedAt: 'modified'
});

User.index({ "locat" : "2dsphere" })
module.exports = mongoose.model('user', User);