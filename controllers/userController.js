const User = require('../models/userModel');
const staticModel = require('../models/staticModel');
const Property = require('../models/propertyModel');
const Report = require('../models/reportModel');
const UserQuery = require('../models/queryModel');
const Room = require('../models/roomModel');
const Category = require('../models/categoryModel');
const Subcategory = require('../models/subcategoryModel');
const PropertyCategory = require('../models/propertyCategoryModel');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const crypto = require("crypto");
const multiparty = require('multiparty');
var cloudinary = require('cloudinary');
var Country = require('country-state-city');
var ObjectId = require('mongodb').ObjectId;
var ChatUser = require('../models/chatUserModel');
var Chat = require('../models/chatModel');
var BlockUser = require('../models/blockModel');
var Notification = require('../models/notificationModel');
var func = require('./comman');
var FCM = require('fcm-node');

var langConfig = {
    "lang": "ar",
    "langFile": "../../locale.json"
}
var i18n_module = require('i18n-nodejs');
var i18n = new i18n_module(langConfig.lang, langConfig.langFile);
console.log(i18n.__('Welcome'));
cloudinary.config({
    cloud_name: 'dfqkwolry',
    api_key: '462474527947692',
    api_secret: 'CWaHDkGydbrGRZ5OATmLr7CVxU4'
});

module.exports = {
    userSignUp: (req, res) => {
        console.log(req.body)
        if (!req.body.mobileNumber || !req.body.countryCode) {
            console.log('All Fields are required')
            return res.json({ response_code: 401, response_message: 'All fields are required' })
        } else {
            var query = { $and: [{ "mobileNumber": req.body.mobileNumber }, { "countryCode": req.body.countryCode }] }
            User.findOne(query, (err, result) => {
                if (err) {
                    console.log('error is', err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result) {
                    console.log('Mobile Number exists')
                    return res.json({ response_code: 401, response_message: 'Mobile Number exists' })
                } else {
                    var jwtToken = jwt.sign({ email: req.body.email }, config.jwtSecretKey)
                    console.log('genreated token is', jwtToken);
                    var professionalId = Math.floor(Math.random() * 100000000);
                    var businessId = Math.floor(Math.random() * 100000000);
                    console.log('generated id is', professionalId, businessId);
                    var userObj = new User({
                        "jwtToken": jwtToken,
                        "deviceType": req.body.deviceType,
                        "deviceToken": req.body.deviceToken,
                        "countryCode": req.body.countryCode,
                        "mobileNumber": req.body.mobileNumber,
                        "fullName": req.body.fullName,
                        "category": req.body.category,
                        "subCategory": req.body.subCategory,
                        "gender": req.body.gender,
                        "birthDate": req.body.birthDate,
                        "email": req.body.email,
                        "country": req.body.country,
                        "currency": req.body.currency,
                        "measurement": req.body.measurement,
                        "appLanguage": req.body.appLanguage,
                        "speakLanguage": req.body.speakLanguage,
                        "termsCondition": req.body.termsCondition,
                        "professionalId": professionalId,
                        "businessId": businessId,
                        // "profileId": id,
                        "locat": {
                            "coordinates": [-0.127758, 51.507351]
                        }
                    });
                    userObj.save((err2, result2) => {
                        if (err2) {
                            console.log('error is', err2)
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else {
                            console.log('signedup successfully')
                            return res.send({ response_code: 200, response_message: 'Signedup successfully ', data: result2 })
                        }
                    })
                }
            })

        }
    },

    userSignout: (req, res) => {
        if (!req.body.userId) {
            console.log('userId is required');
            return res.send({ response_code: 500, response_message: 'Internal server error' })
        } else {
            User.findOneAndUpdate({ _id: req.body.userId }, { $set: { jwtToken: '' } }, { new: true }, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    if (!result) {
                        console.log('User Id is not correct')
                        return res.send({ response_code: 501, response_message: 'User Id is not correct' })
                    } else {
                        console.log('signedout successfully')
                        return res.send({ response_code: 200, response_message: 'Signedout successfully' })
                    }
                }
            })
        }
    },

    userSignin: (req, res) => {
        console.log(req.body)
        if (!req.body.mobileNumber || !req.body.countryCode) {
            console.log('All Fields are required')
            return res.send({ response_code: 401, response_message: 'All Fields are required' })
        } else {
            var query = { $and: [{ "mobileNumber": req.body.mobileNumber }, { "countryCode": req.body.countryCode }] }
            User.findOne(query, (err, result) => {
                if (err) {
                    console.log("err is============>", err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('Mobile number or country code are not correct')
                    return res.send({ response_code: 500, response_message: 'Mobile number or country code are not correct' })
                } else {
                    if (result.status == 'inactive') {
                        return res.send({ response_code: 500, response_message: 'user is blocked' })
                    } else {
                        var jwtToken = jwt.sign({ mobileNumber: req.body.mobileNumber }, config.jwtSecretKey)
                        console.log('genreated token is', jwtToken)
                        User.findOneAndUpdate({ _id: result._id }, { $set: { jwtToken: jwtToken, deviceType: req.body.deviceType, deviceToken: req.body.deviceToken } }, { new: true }, (err2, result2) => {
                            if (err2) {
                                console.log(err2);
                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                            } else {
                                console.log('login successfully')
                                return res.send({ response_code: 200, response_message: 'Login successfully', data: result2 })
                            }
                        })
                    }
                }
            })
        }
    },

    checkUser: (req, res) => {
        console.log(req.body)
        if (!req.body.mobileNumber || !req.body.countryCode) {
            console.log('All Fields are required')
            return res.send({ response_code: 401, response_message: 'All Fields are required' })
        } else {
            var query = { $and: [{ "mobileNumber": req.body.mobileNumber }, { "countryCode": req.body.countryCode }] }
            User.findOne(query, (err, result) => {
                if (err) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result) {
                    console.log('User already exists')
                    return res.send({ response_code: 200, response_message: 'User already exists', Data: result })
                } else {
                    console.log('Invalid credentials')
                    return res.send({ response_code: 401, response_message: 'Invalid credentials' })
                }
            })
        }
    },

    checkSignupExist: (req, res) => {
        console.log(req.body)
        if (!req.body.mobileNumber || !req.body.countryCode) {
            console.log('All Fields are required')
            return res.send({ response_code: 401, response_message: 'All Fields are required' })
        } else {
            var query = { $and: [{ "mobileNumber": req.body.mobileNumber }, { "countryCode": req.body.countryCode }] }
            User.findOne(query, (err, result) => {
                if (err) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result) {
                    console.log('User already exists')
                    return res.send({ response_code: 401, response_message: 'User already exists' })
                } else {
                    console.log('Invalid credentials')
                    return res.send({ response_code: 200, response_message: 'User does not exist', Data: result })
                }
            })
        }
    },

    getStaticContent: (req, res) => {
        staticModel.find({ contentType: { $ne: "Description" } }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, status: "failure", response_message: 'Intermal server error' })
            } else if (result.length == 0) {
                console.log('No data found');
                return res.send({ response_code: 404, status: "failure", response_message: "No Content found" });
            } else {
                console.log('data found successfully');
                return res.send({ response_code: 200, status: "success", response_message: "Content found successfully", data: result });
            }
        })
    },

    getStaticContentByType: (req, res) => {
        if (!req.body.type) {
            console.log('All fileds are required')
            return res.send({ response_code: 401, response_message: 'All fields are required' })
        } else {
            staticModel.findOne({ "contentType": req.body.type }, (error, result) => {
                if (error) {
                    console.log(error);
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    if (req.body.type == 'Home1') {
                        var contentObj = {
                            'title': "Home",
                            'description': "Aqar is the right app if you are looking for apartments for rent or villas for sale or rent  or land for sale in Saudi Arabia. Aqar displays all Saudi real estates ads on Google Maps; navigate in the area you like and find your next home ! You can directly contact the owner and make the deal. We support English Language",
                            'contentType': 'Home1'
                        }
                        staticModel.create(contentObj, (error2, result) => {
                            if (error2) {
                                console.log(error2);
                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                            }
                            else {
                                console.log("Home1 created succesfully.", result);
                                return res.send({ response_code: 200, response_message: 'Home1 created succesfully.', data: result })
                            }
                        })
                    }
                    if (req.body.type == 'AboutUs') {
                        var contentObj = {
                            'title': "About Us",
                            'description': "Aqar is the right app if you are looking for apartments for rent or villas for sale or rent  or land for sale in Saudi Arabia. Aqar displays all Saudi real estates ads on Google Maps; navigate in the area you like and find your next home ! You can directly contact the owner and make the deal. We support English Language",
                            'contentType': 'AboutUs'
                        }
                        staticModel.create(contentObj, (error2, result) => {
                            if (error2) {
                                console.log(error2);
                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                            }
                            else {
                                console.log("AboutUs created succesfully.", result);
                                return res.send({ response_code: 200, response_message: 'AboutUs created succesfully.', data: result })
                            }
                        })
                    }
                    if (req.body.type == 'TermCondition') {
                        var contentObj = {
                            'title': "Terms & Conditions",
                            'description': "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.",
                            'contentType': 'TermCondition'
                        }
                        staticModel.create(contentObj, (error2, result) => {
                            if (error2) {
                                console.log(error2);
                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                            }
                            else {
                                console.log("TermCondition created succesfully.", result);
                                return res.send({ response_code: 200, response_message: 'TermCondition created succesfully.', data: result })
                            }
                        })
                    }
                    if (req.body.type == 'popup') {
                        // var contentObj = {
                        //     'title': "Lorem Ipsum is simply dummy text",
                        //     'description': "Aqar displays all Saudi real estates ads on Google Maps; navigate in the area you like and find your next home ! You can directly contact the owner and make the deal.",
                        //     'contentType': 'Description'
                        // }
                        // staticModel.create(contentObj, (error2, result) => {
                        //     if (error2) {
                        //         console.log(error2);
                        //         return res.send({ response_code: 500, response_message: 'Internal server error' })
                        //     }
                        //     else {
                        //         console.log("popup created succesfully.", result);
                        //         return res.send({ response_code: 200, response_message: 'popup created succesfully.', data: result })
                        //     }
                        // })
                        staticModel.findOne({ "contentType": "Description" }, (error, result) => {
                            if (error) {
                                console.log(error);
                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                            } else if (!result) {
                                console.log(error);
                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                            } else {
                                console.log("TermCondition created succesfully.", result);
                                return res.send({ response_code: 200, response_message: 'Data found succesfully.', data: result })
                            }
                        })
                    }
                } else {
                    console.log(result);
                    return res.send({ response_code: 200, response_message: 'data found', data: result })
                }
            })
        }
    },

    getUserDetails: (req, res) => {
        if (!req.body.userId) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        } else {
            console.log('getttttttttttttt', req.body)
            User.findOne({ _id: req.body.userId }, (error, result) => {
                if (error) {
                    console.log(error)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('User Id is not correct')
                    return res.send({ response_code: 401, response_message: 'User Id is not correct' })
                } else {
                    console.log('Details found successfully')
                    return res.send({ response_code: 200, response_message: "User details found successfully", Data: result });
                }
            })
        }
    },

    userDeleteProfile: (req, res) => {
        if (!req.body._id) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        } else {
            User.findOneAndRemove({ _id: req.body._id }, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                } else if (!result) {
                    console.log('userId is incorrect');
                    return res.send({ response_code: 401, status: "failure", response_message: 'businessId is incorrect' })
                } else {
                    console.log('Profile deleted successfully')
                    return res.send({ response_code: 200, status: "success", response_message: "Profile deleted successfully" });
                }
            })
        }
    },

    postProperty: (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Unsupported content-type" });
            } else {
                var query = { $and: [{ "Type": "professional" }, { userId: fields.userId[0] }] }
                User.findOne(query, (error, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                    } else if (!result) {
                        User.findOne({ _id: fields.userId[0] }, (err8, result8) => {
                            if (err8) {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            } else if (!result8) {
                                return res.send({ response_code: 401, response_message: "userId is required" });
                            } else {
                                let propertyData = new Property({
                                    "Type": fields.type[0],
                                    "status": fields.status[0],
                                    "userId": fields.userId[0],
                                    "title": fields.title[0],
                                    "category": fields.category[0],
                                    "purpose": fields.purpose[0],
                                    "available": fields.available[0],
                                    "bedrooms": fields.bedrooms[0],
                                    "bathrooms": fields.bathrooms[0],
                                    "kitchens": fields.kitchens[0],
                                    "floor": fields.floor[0],
                                    "builtSize": fields.builtSize[0],
                                    "builtSizeUnit": fields.builtSizeUnit[0],
                                    "plotSize": fields.plotSize[0],
                                    "plotSizeUnit": fields.plotSizeUnit[0],
                                    "length": fields.length[0],
                                    "lengthUnit": fields.lengthUnit[0],
                                    "width": fields.width[0],
                                    "widthUnit": fields.widthUnit[0],
                                    "yearBuilt": fields.yearBuilt[0],
                                    "streetView": fields.streetView[0],
                                    "streetWidth": fields.streetWidth[0],
                                    "streetWidthUnit": fields.streetWidthUnit[0],
                                    "description": fields.description[0],
                                    "extrabuildingNo": fields.extrabuildingNo[0],
                                    "extrashowroomNo": fields.extrashowroomNo[0],
                                    "revenue": fields.revenue[0],

                                    "rentTime": fields.rentTime != undefined ? fields.rentTime[0] : '',
                                    "totalPriceRent": fields.totalPriceRent != undefined ? fields.totalPriceRent[0] : '',
                                    "totalPriceSale": fields.totalPriceSale != undefined ? fields.totalPriceSale[0] : '',
                                    "totalPrice": fields.totalPriceSale[0] ? fields.totalPriceSale[0] : fields.totalPriceRent[0],
                                    "defaultDailyPrice": fields.defaultDailyPrice != undefined ? fields.defaultDailyPrice[0] : '',
                                    "defaultWeeklyPrice": fields.defaultWeeklyPrice != undefined ? fields.defaultWeeklyPrice[0] : '',
                                    "defaultMonthlyPrice": fields.defaultMonthlyPrice != undefined ? fields.defaultMonthlyPrice[0] : '',
                                    "defaultyearlyPrice": fields.defaultyearlyPrice != undefined ? fields.defaultyearlyPrice[0] : '',

                                    // "rentTime": fields.rentTime[0],
                                    // "totalPriceRent": fields.totalPriceRent[0],            
                                    // "totalPriceSale": fields.totalPriceSale[0],
                                    // "totalPrice": fields.totalPriceSale[0] ? fields.totalPriceSale[0]: fields.totalPriceRent[0],
                                    // "defaultDailyPrice": fields.defaultDailyPrice[0],
                                    // "defaultWeeklyPrice": fields.defaultWeeklyPrice[0],
                                    // "defaultMonthlyPrice": fields.defaultMonthlyPrice[0],
                                    // "defaultyearlyPrice": fields.defaultyearlyPrice[0],
                                    "sizem2": fields.sizem2[0],
                                    "pricePerMeter": fields.pricePerMeter[0],
                                    "balcony": (fields.balcony[0] == "true") ? true : false,
                                    "garden": (fields.garden[0] == "true") ? true : false,
                                    "parking": (fields.parking[0] == "true") ? true : false,
                                    "modularKitchen": (fields.modularKitchen[0] == "true") ? true : false,
                                    "store": (fields.store[0] == "true") ? true : false,
                                    "lift": (fields.lift[0] == "true") ? true : false,
                                    "duplex": (fields.duplex[0] == "true") ? true : false,
                                    "furnished": (fields.furnished[0] == "true") ? true : false,
                                    "aircondition": (fields.aircondition[0] == "true") ? true : false,
                                    "indoor": fields.indoor[0],
                                    "outdoor": fields.outdoor[0],
                                    "furnish": fields.furnish[0],
                                    "parkingOption": fields.parkingOption[0],
                                    "views": fields.views[0],
                                    "country": fields.country[0],
                                    "state": fields.state[0],
                                    "city": fields.city[0],
                                    "area": fields.area[0],
                                    "zipcode": fields.zipcode[0],
                                    "address": fields.address[0],
                                    "apartmentNo": fields.apartmentNo[0],
                                    "buildingNo": fields.buildingNo[0],
                                    "currency": result8.currency[0],
                                    "long": fields.long[0],
                                    "lat": fields.lat[0],
                                    "location": {
                                        "coordinates": [parseFloat(fields.long[0]), parseFloat(fields.lat[0])]
                                    }
                                });
                                console.log('=========++++>', propertyData)
                                propertyData.save((err1, result1) => {
                                    if (err1) {
                                        console.log('error========>', err1)
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        console.log('images file :' + files.imagesFile)
                                        result1.propId = result1._id;
                                        result1.save((err, prop) => {
                                            if (err) {
                                                console.log('err', err)
                                            } else {
                                                console.log(prop)
                                            }
                                        })
                                        if (files.imagesFile) {
                                            var arrFiles = [];
                                            for (var i = 0; i < files.imagesFile.length; i++) {
                                                cloudinary.v2.uploader.upload(files.imagesFile[i].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err2, result2) => {
                                                    if (err2) {
                                                        console.log('errormsg========>', err2)
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        if (fields.imageCaption) {
                                                            for (var j = 0; j < fields.imageCaption.length; j++) {
                                                                var obj = {};
                                                                obj.image = result2.secure_url;
                                                                obj.imageCaption = fields.imageCaption[j];
                                                                arrFiles.push(obj);
                                                                if (arrFiles.length == files.imagesFile.length) {
                                                                    Property.findByIdAndUpdate({ _id: result1._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err3, result3) => {
                                                                        if (err3) {
                                                                            console.log(err3);
                                                                        }
                                                                        else {
                                                                            console.log("Images updated successfully");
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        } else {
                                                            var obj = {};
                                                            obj.image = result2.secure_url;
                                                            arrFiles.push(obj);
                                                            if (arrFiles.length == files.imagesFile.length) {
                                                                Property.findByIdAndUpdate({ _id: result1._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err3, result3) => {
                                                                    if (err3) {
                                                                        console.log(err3);
                                                                    }
                                                                    else {
                                                                        console.log("Images updated successfully");
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                        if (files.videosFile) {
                                            var videoArr = [];
                                            cloudinary.v2.uploader.upload(files.videosFile[0].path, { resource_type: "video" },
                                                (err4, result4) => {
                                                    if (err4) {
                                                        console.log(err4)
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        var obj = {};
                                                        obj.video = result4.secure_url;
                                                        obj.videoCaption = fields.videoCaption
                                                        videoArr.push(obj);
                                                        if (videoArr.length == files.videosFile.length) {
                                                            Property.findByIdAndUpdate({ _id: result1._id }, { $push: { videosFile: videoArr }, }, { new: true }, (err5, result5) => {
                                                                if (err5) {
                                                                    console.log(err5);
                                                                }
                                                                else {
                                                                    console.log("Video updated successfully");
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                        }
                                        return res.send({ response_code: 200, response_message: "Property posted successfully", Data: result1 });
                                    }
                                })
                            }
                        })
                    } else {
                        User.findOne({ _id: fields.userId[0] }, (err8, result8) => {
                            if (err8) {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            } else if (!result8) {
                                return res.send({ response_code: 401, response_message: "userId is required" });
                            } else {
                                let propertyData = new Property({
                                    "Type": fields.type[0],
                                    "status": fields.status[0],
                                    "userId": fields.userId[0],
                                    "professionalUserId": result._id,
                                    "title": fields.title[0],
                                    "category": fields.category[0],
                                    "purpose": fields.purpose[0],
                                    "available": fields.available[0],
                                    "bedrooms": fields.bedrooms[0],
                                    "bathrooms": fields.bathrooms[0],
                                    "kitchens": fields.kitchens[0],
                                    "floor": fields.floor[0],
                                    "builtSize": fields.builtSize[0],
                                    "builtSizeUnit": fields.builtSizeUnit[0],
                                    "plotSize": fields.plotSize[0],
                                    "plotSizeUnit": fields.plotSizeUnit[0],
                                    "length": fields.length[0],
                                    "lengthUnit": fields.lengthUnit[0],
                                    "width": fields.width[0],
                                    "widthUnit": fields.widthUnit[0],
                                    "yearBuilt": fields.yearBuilt[0],
                                    "streetView": fields.streetView[0],
                                    "streetWidth": fields.streetWidth[0],
                                    "streetWidthUnit": fields.streetWidthUnit[0],
                                    "description": fields.description[0],
                                    "extrabuildingNo": fields.extrabuildingNo[0],
                                    "extrashowroomNo": fields.extrashowroomNo[0],
                                    "revenue": fields.revenue[0],
                                    "rentTime": fields.rentTime != undefined ? fields.rentTime[0] : '',
                                    "totalPriceRent": fields.totalPriceRent != undefined ? fields.totalPriceRent[0] : '',
                                    "totalPriceSale": fields.totalPriceSale != undefined ? fields.totalPriceSale[0] : '',
                                    "totalPrice": fields.totalPriceSale[0] ? fields.totalPriceSale[0] : fields.totalPriceRent[0],
                                    "defaultDailyPrice": fields.defaultDailyPrice != undefined ? fields.defaultDailyPrice[0] : '',
                                    "defaultWeeklyPrice": fields.defaultWeeklyPrice != undefined ? fields.defaultWeeklyPrice[0] : '',
                                    "defaultMonthlyPrice": fields.defaultMonthlyPrice != undefined ? fields.defaultMonthlyPrice[0] : '',
                                    "defaultyearlyPrice": fields.defaultyearlyPrice != undefined ? fields.defaultyearlyPrice[0] : '',
                                    "sizem2": fields.sizem2[0],
                                    "pricePerMeter": fields.pricePerMeter[0],
                                    "balcony": (fields.balcony[0] == "true") ? true : false,
                                    "garden": (fields.garden[0] == "true") ? true : false,
                                    "parking": (fields.parking[0] == "true") ? true : false,
                                    "modularKitchen": (fields.modularKitchen[0] == "true") ? true : false,
                                    "store": (fields.store[0] == "true") ? true : false,
                                    "lift": (fields.lift[0] == "true") ? true : false,
                                    "duplex": (fields.duplex[0] == "true") ? true : false,
                                    "furnished": (fields.furnished[0] == "true") ? true : false,
                                    "aircondition": (fields.aircondition[0] == "true") ? true : false,
                                    "indoor": fields.indoor[0],
                                    "outdoor": fields.outdoor[0],
                                    "furnish": fields.furnish[0],
                                    "parkingOption": fields.parkingOption[0],
                                    "views": fields.views[0],
                                    "country": fields.country[0],
                                    "state": fields.state[0],
                                    "city": fields.city[0],
                                    "area": fields.area[0],
                                    "zipcode": fields.zipcode[0],
                                    "address": fields.address[0],
                                    "apartmentNo": fields.apartmentNo[0],
                                    "buildingNo": fields.buildingNo[0],
                                    "currency": result8.currency[0],
                                    "lat": fields.lat[0],
                                    "long": fields.long[0],
                                    "location": {
                                        "coordinates": [parseFloat(fields.lat[0]), parseFloat(fields.long[0])]
                                    }
                                });
                                propertyData.save((err1, result1) => {
                                    if (err1) {
                                        console.log('error========>', err1)
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        console.log('images file :' + files.imagesFile)
                                        result1.propId = result1._id;
                                        result1.save((err, prop) => {
                                            if (err) {
                                                console.log('err', err)
                                            } else {
                                                console.log(prop)
                                            }
                                        })
                                        if (files.imagesFile) {
                                            var arrFiles = [];
                                            for (var i = 0; i < files.imagesFile.length; i++) {
                                                cloudinary.v2.uploader.upload(files.imagesFile[i].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err2, result2) => {
                                                    if (err2) {
                                                        console.log('errormsg========>', err2)
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        if (fields.imageCaption) {
                                                            for (var j = 0; j < fields.imageCaption.length; j++) {
                                                                var obj = {};
                                                                obj.image = result2.secure_url;
                                                                obj.imageCaption = fields.imageCaption[j];
                                                                arrFiles.push(obj);
                                                                if (arrFiles.length == files.imagesFile.length) {
                                                                    Property.findByIdAndUpdate({ _id: result1._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err3, result3) => {
                                                                        if (err3) {
                                                                            console.log(err3);
                                                                        }
                                                                        else {
                                                                            console.log("Images updated successfully");
                                                                        }
                                                                    })
                                                                }
                                                            }
                                                        } else {
                                                            var obj = {};
                                                            obj.image = result2.secure_url;
                                                            arrFiles.push(obj);
                                                            if (arrFiles.length == files.imagesFile.length) {
                                                                Property.findByIdAndUpdate({ _id: result1._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err3, result3) => {
                                                                    if (err3) {
                                                                        console.log(err3);
                                                                    }
                                                                    else {
                                                                        console.log("Images updated successfully");
                                                                    }
                                                                })
                                                            }
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                        if (files.videosFile) {
                                            var videoArr = [];
                                            cloudinary.v2.uploader.upload(files.videosFile[0].path, { resource_type: "video" },
                                                (err4, result4) => {
                                                    if (err4) {
                                                        console.log(err4)
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        var obj = {};
                                                        obj.video = result4.secure_url;
                                                        obj.videoCaption = fields.videoCaption
                                                        videoArr.push(obj);
                                                        if (videoArr.length == files.videosFile.length) {
                                                            Property.findByIdAndUpdate({ _id: result1._id }, { $push: { videosFile: videoArr }, }, { new: true }, (err5, result5) => {
                                                                if (err5) {
                                                                    console.log(err5);
                                                                }
                                                                else {
                                                                    console.log("Video updated successfully");
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                        }
                                        return res.send({ response_code: 200, response_message: "Property posted successfully", Data: result1 });
                                    }
                                })
                            }
                        })

                    }
                })
            }
        })
    },

    getPropertyDetails: (req, res) => {
        console.log(req.body)
        if (!req.body.propertyId) {
            console.log('Property Id is required')
            return res.send({ response_code: 500, response_message: "Property Id is required" });
        } else if (req.body.type == 'normal') {
            Property.findOne({ _id: req.body.propertyId }).populate('userId').exec((err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (!result) {
                    return res.send({ response_code: 401, response_message: "PropertyId is incorrect" });
                } else {
                    Property.update({ _id: req.body.propertyId }, { $inc: { counter: 1 } }, { upsert: true }, function (err, response) {
                        if (err) {
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else {
                            Property.find({ userId: result.userId }, (err2, result2) => {
                                if (err2) {
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                } else {
                                    var data = JSON.stringify(result)
                                    var data2 = JSON.parse(data)
                                    if (data2.likeUserId.length > 0) {
                                        var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', index)
                                        if (index != -1) {
                                            data2.likedStatus = 'yes'
                                        } else {
                                            data2.likedStatus = 'no'
                                        }
                                    } else {
                                        data2.likedStatus = 'no'
                                    }
                                    data2.mobileNumber = data2.userId.mobileNumber
                                    data2.countryCode = data2.userId.countryCode
                                    data2.userData = data2.userId
                                    data2.userId = data2.userId._id
                                    data2.totalPropertyCreated = result2.length
                                    console.log('Details found successfully')
                                    return res.send({ response_code: 200, response_message: "Property details found successfully", Data: data2 });
                                }
                            })

                        }
                    });
                    // return res.send({ response_code: 200, response_message: "Details found successfully", Data: result});
                }
            })
        } else if (req.body.type == 'professional') {
            Property.findOne({ _id: req.body.propertyId }).populate('professionalUserId').exec((err1, result1) => {
                if (err1) {
                    console.log(err1)
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (!result1) {
                    return res.send({ response_code: 401, response_message: "PropertyId is incorrect" });
                } else {
                    Property.update({ _id: req.body.propertyId }, { $inc: { counter: 1 } }, { upsert: true }, function (err, response) {
                        if (err) {
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else {
                            Property.find({ professionalUserId: result1.professionalUserId }, (err2, result2) => {
                                if (err2) {
                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                } else {
                                    var data = JSON.stringify(result1)
                                    var data2 = JSON.parse(data)
                                    if (data2.likeUserId.length > 0) {
                                        var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', index)
                                        if (index != -1) {
                                            data2.likedStatus = 'yes'
                                        } else {
                                            data2.likedStatus = 'no'
                                        }
                                    } else {
                                        data2.likedStatus = 'no'
                                    }
                                    if (data2.professionalUserId.likeUserId.length > 0) {
                                        var index = data2.professionalUserId.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', index)
                                        if (index != -1) {
                                            data2.professionalUserId.likedStatus = 'yes'
                                        } else {
                                            data2.professionalUserId.likedStatus = 'no'
                                        }
                                    } else {
                                        data2.professionalUserId.likedStatus = 'no'
                                        // return res.send({ response_code: 200, response_message: "User list found successfully", Data:data2});
                                    }
                                    data2.userData = data2.professionalUserId
                                    delete (data2.professionalUserId)
                                    data2.mobileNumber = data2.userId.mobileNumber
                                    data2.countryCode = data2.userId.countryCode
                                    data2.totalPropertyCreated = result2.length
                                    console.log('Details found successfully')
                                    return res.send({ response_code: 200, response_message: "Property details found successfully", Data: data2 });
                                }
                            })

                        }
                    })
                }
            })
        }
    },

    propertylisting: (req, res) => {
        console.log('typeeeeeeee', req.body)
        if (req.body.type == 'sale' || req.body.type == 'rent') {
            if (req.body.userId != '') {
                var query = { $and: [{ "Type": req.body.type }, { userId: { $ne: req.body.userId } }, { "status": "active" }] }
                Property.find(query).sort({ created: -1 }).populate('userId').exec((err1, result1) => {
                    if (err1) {
                        console.log(err1)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result1.length == 0) {
                        console.log('Properties list not found')
                        return res.send({ response_code: 200, response_message: "Properties list not found", Data: [] });
                    } else {
                        var data = JSON.stringify(result1)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                    }
                })
            } else {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                Property.find(query).sort({ created: -1 }).exec((err1, result1) => {
                    if (err1) {
                        console.log(err1)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result1.length == 0) {
                        console.log('Properties list not found')
                        return res.send({ response_code: 200, response_message: "Properties list not found", Data: [] });
                    } else {
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result1 });
                    }
                })
            }

        } else if (req.body.type == 'professional' || req.body.type == 'business') {
            if (req.body.userId != '') {
                var query = { $and: [{ "Type": req.body.type }, { userId: { $ne: req.body.userId } }, { "status": "active" }] }
                User.find(query).sort({ created: -1 }).populate('userId').exec((err1, result1) => {
                    if (err1) {
                        console.log(err1)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result1.length == 0) {
                        console.log('User list not found')
                        return res.send({ response_code: 200, response_message: "User list not found", Data: [] });
                    } else {
                        var data = JSON.stringify(result1)
                        var data2 = JSON.parse(data)
                        console.log('ppppppppppppp', result1)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })

                        console.log('User list found successfully')
                        return res.send({ response_code: 200, response_message: "User list found successfully", Data: resultCustome });
                    }
                })
            } else {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                User.find(query).sort({ created: -1 }).exec((err2, result2) => {
                    if (err2) {
                        console.log(err2)
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (result2.length == 0) {
                        console.log('User list not found')
                        return res.send({ response_code: 200, response_message: "User list not found", Data: [] })
                    } else {
                        console.log('User List found successfully')
                        return res.send({ response_code: 200, response_message: 'User list found successfully', Data: result2 })
                    }
                })
            }
        } else {
            console.log(req.body)
            if (req.body.userId != '') {
                var query = { $and: [{ "Type": { $ne: 'normal' } }, { userId: { $ne: req.body.userId } }, { "status": "active" }] }
                User.find(query).sort({ created: -1 }).populate('userId').exec()
                    .then(result => {
                        var data = JSON.stringify(result)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        var query1 = { $and: [{ userId: { $ne: ObjectId(req.body.userId) } }, { "status": "active" }] }
                        Property.find(query1).sort({ created: -1 }).populate('userId').exec()
                            .then(result1 => {
                                var data = JSON.stringify(result1)
                                var data2 = JSON.parse(data)
                                var resultCustome1 = data2.map(it => {
                                    it.mobileNumber = it.userId.mobileNumber
                                    it.countryCode = it.userId.countryCode
                                    it.userId = it.userId._id
                                    if (it.likeUserId.length > 0) {
                                        var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', index)
                                        if (index != -1) {
                                            it.likedStatus = 'yes'
                                        } else {
                                            it.likedStatus = 'no'
                                        }
                                        return it
                                    }
                                    it.likedStatus = 'no'
                                    return it
                                })
                                var resultData = resultCustome.concat(resultCustome1);
                                return res.send({ response_code: 200, response_message: "All Data found successfully", Data: resultData });
                            }, error => {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            })
                    }, error => {
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    })
            } else {
                var query = { $and: [{ "Type": { $ne: 'normal' } }, { "status": "active" }] }
                // User.find({ Type: { $ne: "normal" }})
                User.find(query).sort({ created: -1 })
                    .then(data => {
                        console.log(data)
                        Property.find({ "status": "active" }).sort({ created: -1 })
                            .then(data2 => {
                                var result = data.concat(data2);
                                return res.send({ response_code: 200, response_message: "All Data found successfully", Data: result });
                            }, error => {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            })
                    }, error => {
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    })
            }

        }
    },

    getpropertyCategory: (req, res) => {
        if (!req.body.type || !req.body.category) {
            console.log('Type & category are required')
            return res.send({ response_code: 401, response_message: "Type & category are required" });
        } else {
            if (req.body.type == 'sale' || req.body.type == 'rent') {
                var query = { $and: [{ "Type": req.body.type }, { "category": req.body.category }, { "status": "active" }] }
                if (req.body.userId) {
                    Property.find(query).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('Properties list not found')
                            return res.send({ response_code: 200, response_message: "Properties list not found", Data: [] });
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    })
                } else {
                    Property.find(query, (err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('Properties list not found')
                            return res.send({ response_code: 200, response_message: "Properties list not found", Data: [] });
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    })
                }
            } else if (req.body.type == 'professional' || req.body.type == 'business') {
                var query = { $and: [{ "Type": req.body.type }, { "Type": { $ne: 'normal' } }, { "category": req.body.category }, { "status": "active" }] }
                if (req.body.userId) {
                    User.find(query).populate('UserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('User list not found')
                            return res.send({ response_code: 200, response_message: "User list not found", Data: [] });
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('User list found successfully')
                            return res.send({ response_code: 200, response_message: "User list found successfully", Data: resultCustome });
                        }
                    })
                } else {
                    User.find(query, (err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('User list not found')
                            return res.send({ response_code: 200, response_message: "User list not found", Data: [] });
                        } else {
                            console.log('User list found successfully')
                            return res.send({ response_code: 200, response_message: "User list found successfully", Data: result });
                        }
                    })
                }
            }
        }
    },

    propertySearchByKeywords: (req, res) => {
        Property.find({ $text: { $search: req.body.searchText } }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result.length == 0) {
                console.log('Data not found')
                return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: [] });
            } else {
                console.log('Properties list found successfully')
                return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
            }
        })
    },

    searchByGooglePlaceApi: (req, res) => {
        if (req.body.type == 'sale' || req.body.type == 'rent') {
            console.log(req.body)
            if (req.body.userId) {
                Property.find(
                    {
                        "location": {
                            $near: {
                                $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                $maxDistance: 30000
                            }
                        }
                    }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data);
                            var resultCustome1 = []
                            data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id;
                                if (it.status == 'active' && it.Type == req.body.type && it.userId != req.body.userId) {
                                    if (it.likeUserId.length > 0) {
                                        var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', it.Type)
                                        if (index != -1) {
                                            it.likedStatus = 'yes'
                                        } else {
                                            it.likedStatus = 'no'
                                        }
                                        resultCustome1.push(it)
                                    } else {
                                        it.likedStatus = 'no'
                                        resultCustome1.push(it)
                                    }

                                }
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfullyuu", Data: resultCustome1 });
                        }
                    })
            } else {
                Property.find(
                    {
                        "location": {
                            $near: {
                                $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                $maxDistance: 30000
                            }
                        }
                    }, (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            let resultCustome2 = []
                            data2.map(it => {
                                if (it.status == 'active' && it.Type == req.body.type) {
                                    resultCustome2.push(it)
                                }
                            })
                            if (resultCustome2.length == 0) {
                                return res.send({ response_code: 200, response_message: 'Properties not found', Data: [] })
                            } else {
                                return res.send({ response_code: 200, response_message: 'Properties found successfully', Data: resultCustome2 })
                            }
                        }
                    })
            }

        } else if (req.body.type == 'professional' || req.body.type == 'business') {
            console.log(req.body)
            if (req.body.userId) {
                User.find(
                    {
                        "locat": {
                            $near: {
                                $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                $maxDistance: 30000
                            }
                        }
                    }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome1 = []
                            data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.status == 'active' && it.Type == req.body.type && it.userId != req.body.userId) {
                                    if (it.likeUserId.length > 0) {
                                        var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', index)
                                        if (index != -1) {
                                            it.likedStatus = 'yes'
                                        } else {
                                            it.likedStatus = 'no'
                                        }
                                        resultCustome1.push(it)
                                    } else {
                                        it.likedStatus = 'no'
                                        resultCustome1.push(it)
                                    }

                                }
                            })
                            console.log('Users found successfully')
                            return res.send({ response_code: 200, response_message: "Users found successfully", Data: resultCustome1 });
                        }
                    })
            } else {
                User.find(
                    {
                        "locat": {
                            $near: {
                                $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                $maxDistance: 30000
                            }
                        }
                    }, (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            let resultCustome2 = []
                            data2.map(it => {
                                if (it.status == 'active' && it.Type == req.body.type) {
                                    resultCustome2.push(it)
                                }
                            })
                            if (resultCustome2.length == 0) {
                                return res.send({ response_code: 200, response_message: 'Users not found', Data: [] })
                            } else {
                                return res.send({ response_code: 200, response_message: 'Users found successfully', Data: resultCustome2 })
                            }
                        }
                    })
            }
        } else {
            if (req.body.userId) {

                console.log('all data')
                User.find(
                    {
                        "locat": {
                            $near: {
                                $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                $maxDistance: 30000
                            }
                        }
                    }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log('===============>', result)
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome1 = []
                            data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.status == 'active' && it.userId != req.body.userId) {
                                    if (it.likeUserId.length > 0) {
                                        var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                        console.log('index', index)
                                        if (index != -1) {
                                            it.likedStatus = 'yes'
                                        } else {
                                            it.likedStatus = 'no'
                                        }
                                        resultCustome1.push(it)
                                    } else {
                                        it.likedStatus = 'no'
                                        resultCustome1.push(it)
                                    }

                                }
                            })
                            Property.find(
                                {
                                    "location": {
                                        $near: {
                                            $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                            $maxDistance: 30000
                                        }
                                    }
                                }).populate('userId').exec((err1, result1) => {
                                    var data = JSON.stringify(result1)
                                    var data2 = JSON.parse(data)
                                    // var resultCustome1 = []
                                    data2.map(it => {
                                        it.mobileNumber = it.userId.mobileNumber
                                        it.countryCode = it.userId.countryCode
                                        it.userId = it.userId._id
                                        if (it.status == 'active' && it.userId != req.body.userId) {
                                            if (it.likeUserId.length > 0) {
                                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                                console.log('index', index)
                                                if (index != -1) {
                                                    it.likedStatus = 'yes'
                                                } else {
                                                    it.likedStatus = 'no'
                                                }
                                                resultCustome1.push(it)
                                            } else {
                                                it.likedStatus = 'no'
                                                resultCustome1.push(it)
                                            }

                                        }
                                    })
                                    // console.log('first user==========', resultCustome)
                                    // console.log('first property==========', resultCustome1)

                                    // var dataResult = resultCustome.concat(resultCustome1);
                                    if (err1) {
                                        return res.send({ response_code: 200, response_message: 'All data found successfully', Data: resultCustome1 })
                                    } else {
                                        // var data = resultCustome.concat(resultCustome1);
                                        return res.send({ response_code: 200, response_message: 'All data found successfully', Data: resultCustome1 })
                                    }
                                })
                        }
                    })
            } else {
                User.find(
                    {
                        "locat": {
                            $near: {
                                $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                $maxDistance: 30000
                            }
                        }
                    }, (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(result.length)
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            let resultCustome1 = []
                            data2.map(it => {
                                if (it.status == 'active' && it.Type != 'normal') {
                                    resultCustome1.push(it)
                                }
                            })
                            console.log('+++++++++++++++++++++', req.body, resultCustome1)
                            Property.find(
                                {
                                    "location": {
                                        $near: {
                                            $geometry: { type: "Point", coordinates: [parseFloat(req.body.lat), parseFloat(req.body.long)] },
                                            $maxDistance: 30000
                                        }
                                    }
                                }, (err1, result1) => {
                                    if (err1) {
                                        return res.send({ response_code: 200, response_message: 'zzAll data found successfully', Data: result })
                                    } else {
                                        var data = JSON.stringify(result1)
                                        var data2 = JSON.parse(data)
                                        let resultCustome2 = []
                                        data2.map(it => {
                                            if (it.status == 'active') {
                                                resultCustome2.push(it)
                                            }
                                        })
                                        var data = resultCustome1.concat(resultCustome2);
                                        if (data.length == 0) {
                                            return res.send({ response_code: 200, response_message: 'Data not found', Data: [] })
                                        } else {
                                            return res.send({ response_code: 200, response_message: 'zzAll data found successfully', Data: data })
                                        }
                                        // var data = result.concat(result1);
                                        // return res.send({response_code: 200, response_message: 'All data found successfully', Data: data})
                                    }
                                })
                        }
                    })
            }

        }
    },

    allProperty: (req, res) => {
        Property.find({}, { _id: 1 }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result.length == 0) {
                console.log('Data not found')
                return res.send({ response_code: 401, response_message: "Data not found", Data: result });
            } else {
                console.log('Properties list found successfully')
                return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
            }
        })
    },

    listDiffProperty: (req, res) => {
        console.log(req.body)
        if (!req.body.userId) {
            console.log('userId is required')
        } else {
            var query = { $and: [{ "Type": "professional" }, { "userId": req.body.userId }] }
            User.findOne(query, (err, result) => {
                if (err) {
                    console.log('Internal server error');
                    return res.send({ response_code: 200, response_message: 'Internal server error' })
                } else if (!result) {
                    var query1 = { $and: [{ "userId": req.body.userId }, { "status": "active" }] }
                    Property.find(query1, (err1, result1) => {
                        if (err1) {
                            console.log('Internal server error');
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else if (result1.length == 0) {
                            console.log('Data not found');
                            return res.send({ response_code: 200, response_message: 'My properties data not found', Data: [] })
                        } else {
                            console.log('Properties list of normal user found successfully')
                            return res.send({ response_code: 200, response_message: "My properties found successfully", Data: result1 });
                        }
                    })
                } else {
                    var query1 = { $and: [{ "userId": req.body.userId }, { "status": "active" }] }
                    Property.find(query1, (err1, result1) => {
                        if (err1) {
                            console.log('Internal server error');
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else if (result1.length == 0) {
                            console.log('Data not found');
                            return res.send({ response_code: 200, response_message: 'My properties data not found', Data: [] })
                        } else {
                            // var arr = [];
                            // arr.push(result)
                            // var data = arr.concat(result1);
                            return res.send({ response_code: 200, response_message: "My properties found successfully", Data: result1 });
                        }
                    })
                }
            })
        }
    },

    myPropertyInactiveList: (req, res) => {
        if (!req.body.userId) {
            console.log('userId is required')
        } else {
            var query = { $and: [{ "Type": "professional" }, { "userId": req.body.userId }] }
            var query1 = { $and: [{ "userId": req.body.userId }, { "status": "inactive" }] }
            User.findOne(query, (err, result) => {
                if (err) {
                    console.log('Internal server error');
                    return res.send({ response_code: 200, response_message: 'Internal server error' })
                } else if (!result) {
                    Property.find(query1, (err1, result1) => {
                        if (err1) {
                            console.log('Internal server error');
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else if (result1.length == 0) {
                            console.log('Data not found');
                            return res.send({ response_code: 200, response_message: 'Properties list not found', Data: [] })
                        } else {
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result1 });
                        }
                    })
                } else {
                    Property.find(query1, (err1, result1) => {
                        if (err1) {
                            console.log('Internal server error');
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else if (result1.length == 0) {
                            console.log('Data not found');
                            return res.send({ response_code: 200, response_message: 'Properties list not found', Data: [] })
                        } else {
                            // var arr = [];
                            // arr.push(result)
                            // var data = arr.concat(result1);
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result1 });
                        }
                    })
                }
            })
        }
    },

    updatePropertyDays: (req, res) => {
        Property.find({}, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result.length == 0) {
                console.log('Data not found')
                return res.send({ response_code: 401, response_message: "Data not found", Data: result });
            } else {
                result.forEach((result2, i) => {
                    var timestamp1 = new Date().getTime();
                    var timestamp2 = result2.createdAt.getTime();
                    var difference = timestamp1 - timestamp2;
                    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                    result2.remainingDays = daysDifference;
                    result2.save(function (err, property) {
                        if (err) {
                            console.log('error')
                        } else {
                            if (parseInt(property.remainingDays) >= 90) {
                                property.status = 'inactive'
                                property.save(function (err1, user1) {
                                    if (err1) {
                                        console.log('err1')
                                    } else {
                                        console.log('user status changed')
                                    }
                                })
                            }
                        }
                    });
                })
            }
        })
    },

    updateParticularProperty: (req, res) => {
        if (!req.body.propertyId) {
            console.log('propertyId is required')
            return res.send({ response_code: 401, response_message: 'propertyId is required' })
        } else {
            Property.findOneAndUpdate({ _id: req.body.propertyId }, { $set: { createdAt: new Date() } }, { new: true }, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (!result) {
                    return res.send({ response_code: 401, response_message: 'propertyId is not correct' })
                } else {
                    var timestamp1 = new Date().getTime();
                    var timestamp2 = result.createdAt.getTime();
                    var difference = timestamp1 - timestamp2
                    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                    result.remainingDays = daysDifference;
                    result.save((err1, result1) => {
                        if (err1) {
                            console.log(err1)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else {
                            return res.send({ response_code: 200, response_message: "Property updated successfully", Data: result1 });
                        }
                    })
                }
            })
        }
    },


    updateParticularProfile: (req, res) => {
        if (!req.body.profOrBusId) {
            console.log('profOrBusId is required')
            return res.send({ response_code: 401, response_message: 'profOrBusId is required' })
        } else {
            User.findOneAndUpdate({ _id: req.body.profOrBusId }, { $set: { createdAt: new Date() } }, { new: true }, (err, result) => {
                if (err) {
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (!result) {
                    return res.send({ response_code: 401, response_message: 'profOrBusId is not correct' })
                } else {
                    var timestamp1 = new Date().getTime();
                    var timestamp2 = result.createdAt.getTime();
                    var difference = timestamp1 - timestamp2
                    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                    result.remainingDays = daysDifference;
                    result.save((err1, result1) => {
                        if (err1) {
                            console.log(err1)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else {
                            return res.send({ response_code: 200, response_message: "Profile updated successfully", Data: result1 });
                        }
                    })
                }
            })
        }
    },

    totalPropertyOfUser: (req, res) => {
        console.log(req.body)
        User.findOne({ _id: req.body.userId }, (err, result) => {
            if (err) {
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (!result) {
                return res.send({ response_code: 401, response_message: 'user not found' })
            } else {
                User.find({ userId: req.body.userId }, (err1, result1) => {
                    if (err) {
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result1.length == 0) {
                        Property.find({ userId: req.body.userId }).countDocuments((err2, result2) => {
                            if (err2) {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            } else if (result2.length == 0) {
                                return res.send({ response_code: 200, user: result });
                            } else {
                                return res.send({ response_code: 200, user: result, property: result2 });
                            }
                        })
                    } else {
                        var data = {}
                        result1.forEach((val, i) => {
                            console.log(val)
                            if (val.Type == 'professional') {
                                var timestamp1 = new Date().getTime();
                                var timestamp2 = val.createdAt.getTime();
                                var difference = timestamp1 - timestamp2;
                                var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                                console.log(daysDifference)
                                if (daysDifference >= 30) {
                                    val.status = 'inactive'
                                    val.save(function (err1, user1) {
                                        if (err1) {
                                            console.log('err1')
                                        } else {
                                            console.log('user status changed')
                                        }
                                    })
                                }
                                data.profRemainingDays = daysDifference
                            } else if (val.Type == 'business') {
                                var timestamp1 = new Date().getTime();
                                var timestamp2 = val.createdAt.getTime();
                                var difference = timestamp1 - timestamp2;
                                var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                                console.log(daysDifference)
                                if (daysDifference >= 30) {
                                    val.status = 'inactive'
                                    val.save(function (err1, user1) {
                                        if (err1) {
                                            console.log('err1')
                                        } else {
                                            console.log('user status changed')
                                        }
                                    })
                                }
                                data.businessRemainingDays = daysDifference
                            }
                            if (result1.length - 1 == i) {
                                Property.find({ userId: req.body.userId }).countDocuments((err3, result3) => {
                                    if (err) {
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else if (result.length == 0) {
                                        return res.send({ response_code: 200, user: result, days: data });
                                    } else {
                                        return res.send({ response_code: 200, user: result, days: data, property: result3 });
                                    }
                                })
                            }
                        })

                    }
                })
            }
        })
    },

    sortProperty: (req, res) => {
        console.log(req.body)
        if (req.body.lowtohighPrice) {
            if (req.body.userId != '') {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }, { userId: { $ne: req.body.userId } }] }
                Property.find(query).sort({ totalPrice: 1 }).populate('userId').exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', data: [] })
                    } else {
                        var data = JSON.stringify(result)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                    }
                });
            } else {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                Property.find(query).sort({ totalPrice: 1 }).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', data: [] })
                    } else {
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                    }
                });
            }
        } else if (req.body.hightolowPrice) {
            if (req.body.userId != '') {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }, { userId: { $ne: req.body.userId } }] }
                Property.find(query).sort({ totalPrice: -1 }).populate('userId').exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                    } else {
                        var data = JSON.stringify(result)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                    }
                });
            } else {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                Property.find(query).sort({ totalPrice: -1 }).exec((err, result) => {
                    // Property.find({"Type": req.body.type}).sort({totalPrice: -1}).exec((err, result)  => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                    } else {
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                    }
                });
            }
        } else if (req.body.lowtohighSize) {
            if (req.body.userId != '') {
                console.log('option3')
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }, { userId: { $ne: req.body.userId } }] }
                Property.find(query).sort({ builtSize: 1 }).populate('userId').exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                    } else {
                        var data = JSON.stringify(result)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                    }
                });
            } else {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                Property.find(query).sort({ builtSize: 1 }).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                    } else {
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                    }
                });
            }
        } else if (req.body.hightolowSize) {
            if (req.body.type) {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }, { userId: { $ne: req.body.userId } }] }
                Property.find(query).sort({ builtSize: -1 }).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                    } else {
                        var data = JSON.stringify(result)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                    }
                });
            } else {
                var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                Property.find(query).sort({ builtSize: -1 }).exec((err, result) => {
                    if (err) {
                        console.log(err)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (result.length == 0) {
                        console.log('property not found');
                        return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                    } else {
                        console.log('Properties list found successfully')
                        return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                    }
                });
            }
        } else if (req.body.sortByName) {
            if (req.body.type == 'professional' || req.body.type == 'business') {
                console.log('sortbyname')
                if (req.body.userId != '') {
                    var query = { $and: [{ "Type": req.body.type }, { "status": "active" }, { userId: { $ne: req.body.userId } }] }
                    User.find(query).sort({ fullName: 1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('User not found');
                            return res.send({ response_code: 401, response_message: 'User not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('User list found successfully')
                            return res.send({ response_code: 200, response_message: "User list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                    User.find(query).sort({ fullName: 1 }).exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('User not found');
                            return res.send({ response_code: 200, response_message: 'User not found', Data: [] })
                        } else {
                            console.log('User list found successfully')
                            return res.send({ response_code: 200, response_message: "User list found successfully", Data: result });
                        }
                    });
                }
            }
        } else if (req.body.sortByCategory) {
            if (req.body.type == 'professional' || req.body.type == 'business') {
                console.log('sortByCategory')
                if (req.body.userId != '') {
                    var query = { $and: [{ "Type": req.body.type }, { "status": "active" }, { userId: { $ne: req.body.userId } }] }
                    User.find(query).sort({ category: 1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('User not found');
                            return res.send({ response_code: 200, response_message: 'User not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('User list found successfully')
                            return res.send({ response_code: 200, response_message: "User list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    var query = { $and: [{ "Type": req.body.type }, { "status": "active" }] }
                    User.find(query).sort({ category: 1 }).exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('User not found');
                            return res.send({ response_code: 200, response_message: 'User not found', Data: [] })
                        } else {
                            console.log('User list found successfully')
                            return res.send({ response_code: 200, response_message: "User list found successfully", Data: result });
                        }
                    });
                }

            }
        } else {
            console.log('fields are required')
            return res.send({ response_code: 401, response_message: 'fields are required' })
        }
    },

    likedPost: (req, res) => {
        if (!req.body.userId || !req.body.type) {
            console.log('UserId & type required')
            return res.json({ response_code: 401, response_message: 'UserId & type required' })
        } else {
            if (req.body.type == 'sale' || req.body.type == 'rent') {
                if (!req.body.propertyId) {
                    console.log('propertyId is required')
                    return res.json({ response_code: 401, response_message: 'propertyId is required' })
                } else {
                    Property.findOne({ _id: req.body.propertyId }, (err, result) => {
                        if (err) {
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else if (!result) {
                            return res.send({ response_code: 401, response_message: 'propertyId is incorrect' })
                        } else {
                            let likeData = [{
                                userId: req.body.userId
                            }]
                            if (req.body.liked == true || req.body.liked == 'true') {
                                Property.findOneAndUpdate({ _id: req.body.propertyId }, { $push: { likeUserId: likeData } }, { new: true }).populate('userId').exec((err1, result1) => {
                                    if (err1) {
                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                    } else if (!result1) {
                                        console.log("Invalid property id")
                                        return res.send({ response_code: 401, response_message: 'PropertyId is incorrect' })
                                    } else {
                                        User.findOne({ _id: req.body.userId }, (err2, result2) => {
                                            if (err2) {
                                                console.log(err2)
                                            } else if (!result2) {
                                                console.log('userId is not correct')
                                            } else {

                                                var notification = new Notification({
                                                    "userId": result1.userId._id,
                                                    "profUserId": result1.professionalUserId ? result1.professionalUserId : '',
                                                    "propOrUserType": result1.Type,
                                                    "propOrRoomOrUserId": req.body.propertyId,
                                                    "title": result2.fullName + ' liked your property - ' + result1.title,
                                                    "notificationType": "property",
                                                });
                                                notification.save((err3, result3) => {
                                                    if (err3) {
                                                        console.log("err3 is===========>", err3);
                                                    } else {
                                                        if (result1.userId.deviceToken && result1.userId.notification == true) {
                                                            func.propertyNotificationForAndroid(result1.userId.deviceToken, result2.fullName + ' liked your property - ' + result1.title, result1._id, "property", result1.Type, result1.userId._id, (err4, result4) => {
                                                                if (err4) {
                                                                    console.log("Error 4 is=========>", err4);
                                                                } else {
                                                                    console.log("Send prop android notification is=============>", result4);
                                                                }
                                                            })
                                                        }
                                                        if (result1.deviceType == 'IOS' && result1.userId.notification == true) {
                                                            func.propertyNotificationForIos(result1.userId.deviceToken, result2.fullName + ' liked your property - ' + result1.title, result1._id, "property", result1.Type, result1.userId._id, (err5, result5) => {
                                                                if (err5) {
                                                                    console.log("Error 5 is=========>", err5);
                                                                } else {
                                                                    console.log("Send ios notification is=============>", result5);
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                        return res.send({ response_code: 200, response_message: 'Property liked successfully', "liked": true })
                                    }
                                })
                            } else if (req.body.liked == false || req.body.liked == 'false') {
                                Property.findOneAndUpdate({ _id: req.body.propertyId, "likeUserId.userId": req.body.userId }, { $pull: { likeUserId: { userId: req.body.userId } } }, { safe: true, new: true }, (error, result) => {
                                    if (error) {
                                        console.log("Error is==========>", error)
                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                    } else if (!result) {
                                        console.log("Invalid property id")
                                        return res.send({ response_code: 401, response_message: 'PropertyId is incorrect' })
                                    } else {
                                        return res.send({ response_code: 200, response_message: 'Property disliked successfully', "liked": false })
                                    }
                                });
                            }

                        }
                    })
                }
            }
            if (req.body.type == 'professional' || req.body.type == 'business') {
                if (!req.body.profbusinessId) {
                    console.log('profbusinessId is required')
                    return res.json({ response_code: 401, response_message: 'profbusinessId is required' })
                } else {
                    User.findOne({ _id: req.body.profbusinessId }, (err, result) => {
                        if (err) {
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else if (!result) {
                            return res.send({ response_code: 401, response_message: 'profbusinessId is incorrect' })
                        } else {
                            let likeData = [{
                                userId: req.body.userId
                            }]
                            if (req.body.liked == true || req.body.liked == 'true') {
                                User.findOneAndUpdate({ _id: req.body.profbusinessId }, { $push: { likeUserId: likeData } }, { new: true }).populate('userId').exec((err1, result1) => {
                                    if (err1) {
                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                    } else if (!result1) {
                                        console.log("Invalid profbusinessId")
                                        return res.send({ response_code: 401, response_message: 'profbusinessId is incorrect' })
                                    } else {
                                        User.findOne({ _id: req.body.userId }, (err2, result2) => {
                                            if (err2) {
                                                console.log(err2)
                                            } else if (!result2) {
                                                console.log('userId is not correct')
                                            } else {
                                                var notification = new Notification({
                                                    "userId": result1.userId._id,
                                                    "propOrUserType": result1.Type,
                                                    "propOrRoomOrUserId": req.body.profbusinessId,
                                                    "title": result2.fullName + ' liked your ' + result1.Type + ' profile',
                                                    "notificationType": "profile",
                                                });
                                                notification.save((err3, result3) => {
                                                    if (err3) {
                                                        console.log("err3 is===========>", err3);
                                                    } else {
                                                        if (result1.userId.deviceToken && result1.userId.notification == true) {
                                                            func.propertyNotificationForAndroid(result1.userId.deviceToken, result2.fullName + ' liked your ' + result1.Type + ' profile', result1._id, "profile", result1.Type, result1.userId._id, (err4, result4) => {
                                                                if (err4) {
                                                                    console.log("Error 4 is=========>", err4);
                                                                } else {
                                                                    console.log("Send profile android notification is=============>", result4);
                                                                }
                                                            })
                                                        }
                                                        if (result1.deviceType == 'IOS' && result1.userId.notification == true) {
                                                            func.propertyNotificationForIos(result1.userId.deviceToken, result2.fullName + ' liked your ' + result1.Type + ' profile', result1._id, "profile", result1.Type, result1.userId._id, (err5, result5) => {
                                                                if (err5) {
                                                                    console.log("Error 5 is=========>", err5);
                                                                } else {
                                                                    console.log("Send ios notification is=============>", result5);
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        })
                                        return res.send({ response_code: 200, response_message: 'Profile liked successfully', "liked": true })
                                    }
                                })
                            } else if (req.body.liked == false || req.body.liked == 'false') {
                                User.findOneAndUpdate({ _id: req.body.profbusinessId, "likeUserId.userId": req.body.userId }, { $pull: { likeUserId: { userId: req.body.userId } } }, { safe: true, new: true }, (error, result) => {
                                    if (error) {
                                        console.log("Error is==========>", error)
                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                    } else if (!result) {
                                        console.log("Invalid profbusinessId")
                                        return res.send({ response_code: 401, response_message: 'profbusinessId is incorrect' })
                                    } else {
                                        console.log("Address deleted successfully", result)
                                        return res.send({ response_code: 200, response_message: 'Profile disliked successfully', "liked": false })
                                    }
                                });
                            }
                        }
                    })
                }
            }
        }
    },


    listLikedPost: (req, res) => {
        if (req.body.type == 'sale' || req.body.type == 'rent') {
            var query = ({ $and: [{ "Type": req.body.type }, { 'likeUserId.userId': req.body.userId }] })
            Property.find(query).sort({ created: -1 }).populate('userId').exec((err, result) => {
                if (err) {
                    console.log('Internal server error');
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result.length == 0) {
                    return res.send({ response_code: 200, response_message: 'Liked data not found', Data: [] })
                } else {
                    var data = JSON.stringify(result);
                    var data2 = JSON.parse(data)
                    var resultCustome = data2.map(it => {
                        it.mobileNumber = it.userId.mobileNumber
                        it.countryCode = it.userId.countryCode
                        it.userId = it.userId._id
                        return it
                    })
                    console.log('liked list found')
                    return res.send({ response_code: 200, response_message: 'Liked list found', Data: resultCustome })
                }
            })
        }
        if (req.body.type == 'professional' || req.body.type == 'business') {
            var query = ({ $and: [{ "Type": req.body.type }, { 'likeUserId.userId': req.body.userId }] })
            User.find(query).sort({ created: -1 }).populate('userId').exec((err, result) => {
                if (err) {
                    console.log('Internal server error');
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result.length == 0) {
                    return res.send({ response_code: 200, response_message: 'Liked data not found', Data: [] })
                } else {
                    var data = JSON.stringify(result);
                    var data2 = JSON.parse(data)
                    var resultCustome = data2.map(it => {
                        it.mobileNumber = it.userId.mobileNumber
                        it.countryCode = it.userId.countryCode
                        it.userId = it.userId._id
                        return it
                    })
                    return res.send({ response_code: 200, response_message: 'Liked list found', Data: resultCustome })
                }
            })
        }

    },

    recentPost: (req, res) => {
        if (!req.body.type) {
            console.log('type is required')
            return res.json({ response_code: 401, response_message: 'type is required' })
        } else {
            var start_date = new Date(new Date().setHours(0, 0, 0, -1));
            var end_date = new Date();
            var query = { $and: [{ "created": { "$gte": start_date, "$lte": end_date } }, { "Type": req.body.type }, { "status": "active" }, { "userId": { $ne: req.body.userId } }] }
            if (req.body.type == 'sale' || req.body.type == 'rent') {
                Property.find(query).sort({ created: -1 }).populate('userId').exec((err1, result1) => {
                    if (err1) {
                        console.log('Internal server error');
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (result1.lenght == 0) {
                        return res.send({ response_code: 200, response_message: 'Not found', Data: [] })
                    } else {
                        var data = JSON.stringify(result1)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Recent properties found');
                        return res.send({ response_code: 200, response_message: 'Recent properties found successfully', Data: resultCustome })
                    }
                });
            } else if (req.body.type == 'professional' || req.body.type == 'business') {
                User.find(query).sort({ created: -1 }).populate('userId').exec((err, result) => {
                    if (err) {
                        console.log('Internal server error');
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (result.lenght == 0) {
                        return res.send({ response_code: 200, response_message: 'Not found', Data: [] })
                    } else {
                        var data = JSON.stringify(result)
                        var data2 = JSON.parse(data)
                        var resultCustome = data2.map(it => {
                            it.mobileNumber = it.userId.mobileNumber
                            it.countryCode = it.userId.countryCode
                            it.userId = it.userId._id
                            if (it.likeUserId.length > 0) {
                                var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                console.log('index', index)
                                if (index != -1) {
                                    it.likedStatus = 'yes'
                                } else {
                                    it.likedStatus = 'no'
                                }
                                return it
                            }
                            it.likedStatus = 'no'
                            return it
                        })
                        console.log('Recent users found');
                        return res.send({ response_code: 200, response_message: 'Recent users found successfully', Data: resultCustome })
                    }
                });
            }
        }
    },

    searchBusinessProfessional: (req, res) => {
        let data = [];
        if (req.body.fullName) {
            data.push({ fullName: req.body.fullName })
        }
        if (req.body.type == 'professional') {
            if (req.body.professionalId) {
                data.push({ professionalId: { '$regex': req.body.professionalId } })
            }
        }
        if (req.body.type == 'business') {
            if (req.body.businessId) {
                data.push({ businessId: { '$regex': req.body.businessId } })
            }
        }
        if (req.body.category) {
            data.push({ category: req.body.category })
        }
        if (req.body.subCategory) {
            data.push({ subCategory: req.body.subCategory })
        }
        if (req.body.specialities) {
            data.push({ specialities: req.body.specialities })
        }
        if (req.body.lat) {
            data.push({ lat: req.body.lat })
        }
        if (req.body.long) {
            data.push({ long: req.body.long })
        }
        if (req.body.area) {
            data.push({ area: req.body.area })
        }
        if (req.body.speakLanguage) {
            data.push({ speakLanguage: req.body.speakLanguage })
        }
        if (req.body.userId) {
            data.push({ "userId": { $ne: req.body.userId } })
            data.push({ "Type": req.body.type })
        } else {
            data.push({ "Type": req.body.type })
        }
        // var query = { $or: data}
        // var query = ({ $and : [{ $or: data}, { "Type": req.body.type }, { "userId": { $ne: req.body.userId }} ] })
        var query = { $and: data }
        console.log(JSON.stringify(query))
        User.find(query).populate('userId').exec((err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('Users not found')
                return res.send({ response_code: 200, response_message: 'Users not found', data: [] })
            } else {
                var data = JSON.stringify(result)
                var data2 = JSON.parse(data)
                var resultCustome = data2.map(it => {
                    it.mobileNumber = it.userId.mobileNumber
                    it.countryCode = it.userId.countryCode
                    it.userId = it.userId._id
                    if (it.likeUserId.length > 0) {
                        var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                        console.log('index', index)
                        if (index != -1) {
                            it.likedStatus = 'yes'
                        } else {
                            it.likedStatus = 'no'
                        }
                        return it
                    }
                    it.likedStatus = 'no'
                    return it
                })
                console.log('Business or pofessional users found successfully')
                return res.send({ response_code: 200, response_message: 'Business or pofessional users found successfully', data: resultCustome })
            }
        })
    },

    searchSaleOrRent: (req, res) => {
        console.log('search sale', req.body)
        let data = [];
        if (req.body.propertyId) {
            data.push({ _id: req.body.propertyId })
        }
        if (req.body.category) {
            data.push({ category: req.body.category })
        }
        if (req.body.purpose) {
            data.push({ purpose: req.body.purpose })
        }
        if (req.body.available) {
            data.push({ available: req.body.available })
        }
        if (req.body.bedrooms) {
            data.push({ bedrooms: req.body.bedrooms })
        }
        if (req.body.bathrooms) {
            data.push({ bathrooms: req.body.bathrooms })
        }
        if (req.body.kitchens) {
            data.push({ kitchens: req.body.kitchens })
        }
        if (req.body.rentTime) {
            data.push({ rentTime: req.body.rentTime })
        }
        if (req.body.plotSizeMin && req.body.plotSizeMax) {
            data.push({ "plotSize": { "$gte": req.body.plotSizeMin, "$lte": req.body.plotSizeMax } })
        }
        // if(req.body.builtSizeMin && req.body.builtSizeMax) {
        //     data.push({"builtSize": {"$gte": req.body.builtSizeMin, "$lte": req.body.builtSizeMax} })
        // } 
        if (req.body.totalPriceMin && req.body.totalPriceMax) {
            data.push({ "totalPrice": { "$gte": req.body.totalPriceMin, "$lte": req.body.totalPriceMax } })
        }
        if (req.body.yearBuilt) {
            data.push({ yearBuilt: req.body.yearBuilt })
        }
        if (req.body.balcony == "1" || req.body.balcony == 'true') {
            data.push({ balcony: req.body.balcony })
        }
        if (req.body.garden == "1" || req.body.garden == 'true') {
            data.push({ garden: req.body.garden })
        }
        if (req.body.parking == "1" || req.body.parking == 'true') {
            data.push({ parking: req.body.parking })
        }
        if (req.body.modularKitchen == "1" || req.body.modularKitchen == 'true') {
            data.push({ modularKitchen: req.body.modularKitchen })
        }
        if (req.body.store == "1" || req.body.store == 'true') {
            data.push({ store: req.body.store })
        }
        if (req.body.lift == "1" || req.body.lift == 'true') {
            data.push({ lift: req.body.lift })
        }
        if (req.body.duplex == "1" || req.body.duplex == 'true') {
            data.push({ duplex: req.body.duplex })
        }
        if (req.body.furnished == "1" || req.body.furnished == 'true') {
            data.push({ furnished: req.body.furnished })
        }
        if (req.body.aircondition == "1" || req.body.aircondition == 'true') {
            data.push({ aircondition: req.body.aircondition })
        }
        if (req.body.photos == "1" || req.body.photos == 'true') {
            data.push({ imagesFile: { $exists: true, $not: { $size: 0 } } })
        }
        if (req.body.videos == "1" || req.body.videos == 'true') {
            data.push({ videosFile: { $exists: true, $not: { $size: 0 } } })
        }
        if (req.body.userId) {
            data.push({ "userId": { $ne: req.body.userId } })
            data.push({ Type: req.body.type })
        } else {
            data.push({ Type: req.body.type })
        }
        // var query = ({ $and : [ { $or: data }, { "Type": req.body.type }, { "userId": { $ne: req.body.userId }}] })
        var query = { $and: data }
        console.log(JSON.stringify(query))
        Property.find(query).populate('userId').exec((err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('Data not found')
                return res.send({ response_code: 200, response_message: 'Data not found', data: [] })
            } else {
                var data = JSON.stringify(result)
                var data2 = JSON.parse(data)
                var resultCustome = data2.map(it => {
                    it.mobileNumber = it.userId.mobileNumber
                    it.countryCode = it.userId.countryCode
                    it.userId = it.userId._id
                    if (it.likeUserId.length > 0) {
                        var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                        console.log('index', index)
                        if (index != -1) {
                            it.likedStatus = 'yes'
                        } else {
                            it.likedStatus = 'no'
                        }
                        return it
                    }
                    it.likedStatus = 'no'
                    return it
                })
                console.log('Data found successfully')
                return res.send({ response_code: 200, response_message: 'Properties found successfully ', data: resultCustome })
            }
        })
    },

    createBusinessOrProfessional: (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Unsupported content-type" });
            } else {
                console.log('business or professional', fields, files)
                User.findOne({ _id: fields.userId }, (err15, result15) => {
                    if (err15) {
                        console.log(err15)
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (!result15) {
                        console.log('userId is incorrect')
                        return res.send({ response_code: 500, response_message: "userId is incorrect" });
                    } else {
                        if (fields.type == 'business') {
                            result15.businessProfile = true
                        }
                        if (fields.type == 'professional') {
                            result15.professionalProfile = true
                        }
                        result15.save((err16, result16) => {
                            if (err16) {
                                return res.send({ response_code: 500, response_message: "userId is incorrect" });
                            } else {
                                console.log('imagesssssssssss', files)
                                let userData = new User({
                                    "userId": fields.userId,
                                    "Type": fields.type,
                                    "status": fields.status,
                                    "birthDate": fields.birthDate,
                                    "fullName": fields.fullName,
                                    "category": fields.category,
                                    "subCategory": fields.subCategory,
                                    "state": fields.state,
                                    "city": fields.city,
                                    "zipcode": fields.zipcode,
                                    "area": fields.area,
                                    "lat": fields.lat,
                                    "long": fields.long,
                                    "countryCode": result15.countryCode,
                                    "mobileNumber": fields.mobileNumber,
                                    "website": fields.website,
                                    "email": fields.email,
                                    "facebookUrl": fields.facebookUrl,
                                    "googleplusUrl": fields.googleplusUrl,
                                    "twitterUrl": fields.twitterUrl,
                                    "snapchatUrl": fields.snapchatUrl,
                                    "linkedinUrl": fields.linkedinUrl,
                                    "description": fields.description,
                                    "projectAchieved": fields.projectAchieved,
                                    "specialities": fields.specialities,
                                    "areaCovered": fields.areaCovered,
                                    "govtIdType1": fields.govtIdType1,
                                    "govtIdNumber1": fields.govtIdNumber1,
                                    "govtIdType2": fields.govtIdType2,
                                    "govtIdNumber2": fields.govtIdNumber2,
                                    "professionalId": fields.professionalId ? fields.professionalId : '',
                                    "businessId": fields.businessId ? fields.businessId : '',
                                    "speakLanguage": result15.speakLanguage,
                                    "locat": {
                                        "coordinates": [parseFloat(fields.lat), parseFloat(fields.long)]
                                    }
                                });
                                userData.save((err1, result1) => {
                                    if (err1) {
                                        console.log(err1)
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        console.log(result1._id)
                                        if (fields.type == 'professional') {
                                            Property.updateMany({ "userId": fields.userId }, { $set: { "professionalUserId": result1._id } }, { new: true }, (err2, result2) => {
                                                if (err2) {
                                                    console.log(err2)
                                                } else {
                                                    console.log(result2)
                                                    User.findByIdAndUpdate({ "_id": fields.userId }, { $set: { "professional_id": result1._id } }, { new: true }, (err20, result20) => {
                                                        if (err20) {
                                                            console.log(err20);
                                                        } else {
                                                            console.log('professional_id saved');
                                                        }
                                                    })
                                                    console.log('==========professional property updated')
                                                }
                                            })

                                        }
                                        if (fields.type == 'business') {
                                            User.findByIdAndUpdate({ "_id": fields.userId }, { $set: { "business_id": result1._id } }, { new: true }, (err21, result21) => {
                                                if (err21) {
                                                    console.log(err21);
                                                } else {
                                                    console.log('business_id saved');
                                                }
                                            })
                                        }
                                        if (files.profileImage) {
                                            cloudinary.v2.uploader.upload(files.profileImage[0].path, { resource_type: 'image' }, (err2, result2) => {
                                                if (err2) {
                                                    console.log(err2)
                                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                } else {
                                                    fields.profileImage = result2.secure_url;
                                                    User.findByIdAndUpdate({ _id: result1._id }, fields, { new: true }, (err3, result3) => {
                                                        if (err3) {
                                                            console.log(err3);
                                                        } else {
                                                            console.log('Profile image updated successfully')
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        if (files.imagesFile) {
                                            var arrFiles = [];
                                            for (var i = 0; i < files.imagesFile.length; i++) {
                                                cloudinary.v2.uploader.upload(files.imagesFile[i].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err4, result4) => {
                                                    if (err4) {
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        var obj = {};
                                                        obj.image = result4.secure_url;
                                                        arrFiles.push(obj);
                                                        console.log('imaaaaaaaaaaaaaa', arrFiles)
                                                        if (arrFiles.length == files.imagesFile.length) {
                                                            User.findByIdAndUpdate({ _id: result1._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err5, result5) => {
                                                                if (err5) {
                                                                    console.log(err5);
                                                                } else {
                                                                    console.log("Images updated successfully");
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                        if (files.videosFile) {
                                            var videoArr = [];
                                            cloudinary.v2.uploader.upload(files.videosFile[0].path, { resource_type: "video" }, (err6, result6) => {
                                                if (err6) {
                                                    console.log(err6)
                                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                } else {
                                                    var obj = {};
                                                    obj.video = result6.secure_url;
                                                    videoArr.push(obj);
                                                    if (videoArr.length == files.videosFile.length) {
                                                        User.findByIdAndUpdate({ _id: result1._id }, { $push: { videosFile: videoArr } }, { new: true }, (err7, result7) => {
                                                            if (err7) {
                                                                console.log(err7);
                                                            } else {
                                                                console.log("Video updated successfully");
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                        if (files.govtIdImage1) {
                                            cloudinary.v2.uploader.upload(files.govtIdImage1[0].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err8, result8) => {
                                                if (err8) {
                                                    console.log(err8)
                                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                } else {
                                                    fields.govtIdImage1 = result8.secure_url;
                                                    User.findByIdAndUpdate({ _id: result1._id }, fields, { new: true }, (err9, result9) => {
                                                        if (err9) {
                                                            console.log(err9);
                                                        } else {
                                                            console.log('social Documents updated successfully')
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        if (files.govtIdImage2) {
                                            cloudinary.v2.uploader.upload(files.govtIdImage2[0].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err10, result10) => {
                                                if (err10) {
                                                    console.log(err10)
                                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                } else {
                                                    fields.govtIdImage2 = result10.secure_url;
                                                    User.findByIdAndUpdate({ _id: result1._id }, fields, { new: true }, (err11, result11) => {
                                                        if (err11) {
                                                            console.log(err11);
                                                        } else {
                                                            console.log('social Documents updated successfully')
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                        if (fields.type == 'professional') {
                                            return res.send({ response_code: 200, response_message: "Professional profile created successfully", Data: result1 });
                                        } else {
                                            return res.send({ response_code: 200, response_message: "Business profile created successfully", Data: result1 });
                                        }
                                    }
                                })
                            }
                        })

                    }
                })


            }
        })
    },

    getBusinessOrProfessionalProfile: (req, res) => {
        if (!req.body.userId) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        } else {
            var query = { userId: req.body.userId, Type: { $ne: 'normal' } }
            User.find(query, (error, result) => {
                if (error) {
                    console.log(error)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('User Id is not correct')
                    return res.send({ response_code: 401, response_message: 'User Id is not correct' })
                } else {
                    if (result.Type == 'professional') {
                        return res.send({ response_code: 200, response_message: "Professional profile found successfully", Data: result });
                    } else {
                        return res.send({ response_code: 200, response_message: "Business profile found successfully", Data: result });
                    }
                }
            })
        }
    },

    getProfessionalProfile: (req, res) => {
        if (!req.body.userId) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        } else {
            var query = { $and: [{ "Type": req.body.Type }, { "userId": req.body.userId }] }
            User.findOne(query, (error, result) => {
                if (error) {
                    console.log(error)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('User Id is not correct')
                    return res.send({ response_code: 401, response_message: 'User Id is not correct' })
                } else {
                    if (result.Type == 'professional') {
                        return res.send({ response_code: 200, response_message: "Professional profile found successfully", Data: result });
                    } else {
                        return res.send({ response_code: 200, response_message: "Business profile found successfully", Data: result });
                    }
                }
            })
        }
    },

    getBusinessOrProfessionalDetails: (req, res) => {
        if (!req.body.profbusinessId) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        } else {
            if (req.body.userId) {
                User.findOne({ _id: req.body.profbusinessId }).populate('userId').exec((error, result) => {
                    if (error) {
                        console.log(error)
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (!result) {
                        console.log('profbusinessId is not correct')
                        return res.send({ response_code: 401, response_message: 'profbusinessId is not correct' })
                    } else {
                        var arr = []
                        arr.push({ image: result.profileImage })
                        result.imagesFile.map(value => arr.push({ image: value.image }))
                        User.update({ _id: req.body.profbusinessId }, { $inc: { counter: 1 } }, { upsert: true }, function (err, response) {
                            if (err) {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            } else {
                                if (req.body.type == 'professional') {
                                    Property.find({ professionalUserId: req.body.profbusinessId }, (err2, result2) => {
                                        if (err2) {
                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                        } else {
                                            var data = JSON.stringify(result)
                                            var data2 = JSON.parse(data)
                                            if (data2.likeUserId.length > 0) {
                                                var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                                console.log('index', index)
                                                if (index != -1) {
                                                    data2.likedStatus = 'yes'
                                                } else {
                                                    data2.likedStatus = 'no'
                                                }
                                            } else {
                                                data2.likedStatus = 'no'
                                            }
                                            var query = { $and: [{ "Type": 'professional' }, { "userId": req.body.businessUserId }] }
                                            User.findOne(query, (err3, result3) => {
                                                if (err3) {
                                                    console.lgo(err3)
                                                } else if (!result3) {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = false
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        }
                                                    })
                                                } else {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = true
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.professionalProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        }
                                                    })
                                                }
                                            })
                                            // data2.mobileNumber = data2.userId.mobileNumber
                                            // data2.countryCode=data2.userId.countryCode
                                            // data2.userId = data2.userId._id
                                            // data2.totalPropertyCreated = result2.length
                                            // console.log('User found successfully');
                                            // return res.send({ response_code: 200, response_message: "Professional profile found successfully", Data: data2});
                                        }
                                    })
                                } else {
                                    Property.find({ userId: req.body.businessUserId }, (err2, result2) => {
                                        if (err2) {
                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                        } else {
                                            var data = JSON.stringify(result)
                                            var data2 = JSON.parse(data)
                                            if (data2.likeUserId.length > 0) {
                                                var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                                console.log('index', index)
                                                if (index != -1) {
                                                    data2.likedStatus = 'yes'
                                                } else {
                                                    data2.likedStatus = 'no'
                                                }
                                            } else {
                                                data2.likedStatus = 'no'
                                            }
                                            var query = { $and: [{ "Type": 'professional' }, { "userId": req.body.businessUserId }] }
                                            User.findOne(query, (err3, result3) => {
                                                if (err3) {
                                                    console.lgo(err3)
                                                } else if (!result3) {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = false
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "zDetails found successfully", Data: data2 });
                                                        }
                                                    })
                                                } else {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = true
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.professionalProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        }
                                                    })
                                                }
                                            })
                                            // data2.mobileNumber = data2.userId.mobileNumber
                                            // data2.countryCode=data2.userId.countryCode
                                            // data2.userId = data2.userId._id
                                            // data2.totalPropertyCreated = result2.length
                                            // console.log('Business found successfully');
                                            // return res.send({ response_code: 200, response_message: "Business profile found successfully", Data: data2});
                                        }
                                    })
                                }
                            }
                        });
                    }
                })
            } else {
                // User.findOne({_id: req.body.profbusinessId},(error, result) => {
                //     if(error) {
                //         console.log(error)
                //         return res.send({ response_code: 500, response_message: 'Internal server error'})
                //     } else if(!result){
                //         console.log('profbusinessId is not correct')
                //         return res.send({ response_code: 401, response_message: 'profbusinessId is not correct'})
                //     } else {
                //         var arr = [];
                //         arr.push({image: result.profileImage})
                //         result.imagesFile.map(value => arr.push({image: value.image}))
                //         User.update({_id: req.body.profbusinessId}, {$inc: {counter: 1}}, {upsert: true}, function(err, response) {
                //             if (err) {
                //                 return res.send({ response_code: 500, response_message: "Internal server error" });
                //             } else {
                //                 result.imagesFile = arr;
                //                 console.log('User found successfully');
                //                 return res.send({ response_code: 200, response_message: "Business or Professional profile found successfully", Data: result});
                //             }
                //         });
                //     }
                // })  
                User.findOne({ _id: req.body.profbusinessId }).populate('userId').exec((error, result) => {
                    if (error) {
                        console.log(error)
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (!result) {
                        console.log('profbusinessId is not correct')
                        return res.send({ response_code: 401, response_message: 'profbusinessId is not correct' })
                    } else {
                        var arr = []
                        arr.push({ image: result.profileImage })
                        result.imagesFile.map(value => arr.push({ image: value.image }))
                        User.update({ _id: req.body.profbusinessId }, { $inc: { counter: 1 } }, { upsert: true }, function (err, response) {
                            if (err) {
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            } else {
                                if (req.body.type == 'professional') {
                                    Property.find({ professionalUserId: req.body.profbusinessId }, (err2, result2) => {
                                        if (err2) {
                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                        } else {
                                            var data = JSON.stringify(result)
                                            var data2 = JSON.parse(data)
                                            if (data2.likeUserId.length > 0) {
                                                var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                                console.log('index', index)
                                                if (index != -1) {
                                                    data2.likedStatus = 'yes'
                                                } else {
                                                    data2.likedStatus = 'no'
                                                }
                                            } else {
                                                data2.likedStatus = 'no'
                                            }
                                            var query = { $and: [{ "Type": 'professional' }, { "userId": req.body.businessUserId }] }
                                            User.findOne(query, (err3, result3) => {
                                                if (err3) {
                                                    console.lgo(err3)
                                                } else if (!result3) {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = false
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        }
                                                    })
                                                } else {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = true
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.professionalProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        }
                                                    })
                                                }
                                            })
                                            // data2.mobileNumber = data2.userId.mobileNumber
                                            // data2.countryCode=data2.userId.countryCode
                                            // data2.userId = data2.userId._id
                                            // data2.totalPropertyCreated = result2.length
                                            // console.log('User found successfully');
                                            // return res.send({ response_code: 200, response_message: "Professional profile found successfully", Data: data2});
                                        }
                                    })
                                } else {
                                    Property.find({ userId: req.body.businessUserId }, (err2, result2) => {
                                        if (err2) {
                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                        } else {
                                            var data = JSON.stringify(result)
                                            var data2 = JSON.parse(data)
                                            if (data2.likeUserId.length > 0) {
                                                var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                                console.log('index', index)
                                                if (index != -1) {
                                                    data2.likedStatus = 'yes'
                                                } else {
                                                    data2.likedStatus = 'no'
                                                }
                                            } else {
                                                data2.likedStatus = 'no'
                                            }
                                            var query = { $and: [{ "Type": 'professional' }, { "userId": req.body.businessUserId }] }
                                            User.findOne(query, (err3, result3) => {
                                                if (err3) {
                                                    console.lgo(err3)
                                                } else if (!result3) {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = false
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "zDetails found successfully", Data: data2 });
                                                        }
                                                    })
                                                } else {
                                                    var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                    User.findOne(query1, (err4, result4) => {
                                                        if (err4) {
                                                            console.lgo(err3)
                                                        } else if (!result4) {
                                                            data2.imagesFile = arr
                                                            data2.professionalProfileExists = true
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        } else {
                                                            data2.imagesFile = arr
                                                            data2.commanUserProfessionalId = result3._id
                                                            data2.commanUserBusinessId = result4._id
                                                            data2.businessProfileExists = true
                                                            data2.professionalProfileExists = true
                                                            data2.totalPropertyCreated = result2.length
                                                            data2.mobileNumber = data2.userId.mobileNumber
                                                            data2.countryCode = data2.userId.countryCode
                                                            data2.userId = data2.userId._id
                                                            console.log('Details found successfully')
                                                            return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                        }
                                                    })
                                                }
                                            })
                                            // data2.mobileNumber = data2.userId.mobileNumber
                                            // data2.countryCode=data2.userId.countryCode
                                            // data2.userId = data2.userId._id
                                            // data2.totalPropertyCreated = result2.length
                                            // console.log('Business found successfully');
                                            // return res.send({ response_code: 200, response_message: "Business profile found successfully", Data: data2});
                                        }
                                    })
                                }
                            }
                        });
                    }
                })
            }

        }
    },

    updateNormalProfile: (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Unsupported content-type" });
            } else {
                console.log(fields)
                User.findOne({ _id: fields.userId }, (error, result) => {
                    if (error) {
                        console.log(error)
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (!result) {
                        console.log('userId is incorrect');
                        return res.send({ response_code: 401, response_message: 'userId is incorrect' })
                    } else {
                        if (files.profileImage) {
                            cloudinary.v2.uploader.upload(files.profileImage[0].path, { resource_type: 'image' }, (err1, result1) => {
                                if (err1) {
                                    console.log(err1)
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    fields.profileImage = result1.secure_url;
                                    User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err2, result2) => {
                                        if (err2) {
                                            console.log(err2);
                                        } else {
                                            console.log("Images updated successfully");
                                        }
                                    })
                                }
                            })
                        }
                        if (files.govtIdImage1) {
                            cloudinary.v2.uploader.upload(files.govtIdImage1[0].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err4, result4) => {
                                if (err4) {
                                    console.log(err4)
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    fields.govtIdImage1 = result4.secure_url;
                                    User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err5, result5) => {
                                        if (err5) {
                                            console.log(err5);
                                        } else {
                                            console.log('social Documents updated successfully')
                                        }
                                    })
                                }
                            })
                        }
                        if (files.govtIdImage2) {
                            cloudinary.v2.uploader.upload(files.govtIdImage2[0].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err6, result6) => {
                                if (err6) {
                                    console.log(err6)
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    fields.govtIdImage2 = result6.secure_url;
                                    User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err7, result7) => {
                                        if (err7) {
                                            console.log(err7);
                                        } else {
                                            console.log('social Documents updated successfully')
                                        }
                                    })
                                }
                            })
                        }
                        User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err8, result8) => {
                            if (err8) {
                                console.log(err8);
                            } else {
                                console.log('profile updated successfully');
                                return res.send({ response_code: 200, response_message: "Profile updated successfully", Data: result8 });
                            }
                        })
                    }
                })
            }
        });
    },

    updateBusinessOrProfessionalProfile: (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Unsupported content-type" });
            } else {
                User.findOne({ _id: fields.profbusId }, (error, result) => {
                    if (error) {
                        console.log(error)
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else if (!result) {
                        console.log('userId is incorrect');
                        return res.send({ response_code: 401, response_message: 'userId is incorrect' })
                    } else {
                        if (files.profileImage) {
                            cloudinary.v2.uploader.upload(files.profileImage[0].path, { resource_type: 'image' }, (err1, result1) => {
                                if (err1) {
                                    console.log(err1)
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    fields.profileImage = result1.secure_url;
                                    User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err2, result2) => {
                                        if (err2) {
                                            console.log(err2);
                                        } else {
                                            console.log("Images updated successfully");
                                        }
                                    })
                                }
                            })
                        }
                        delete (fields.profileImage);
                        if (files.imagesFile) {
                            User.findByIdAndUpdate({ _id: result._id }, { $set: { imagesFile: [] } }, (err10, result10) => {
                                if (err10) {
                                    console.log(err10)
                                } else {
                                    var arrFiles = [];
                                    for (var i = 0; i < files.imagesFile.length; i++) {
                                        cloudinary.v2.uploader.upload(files.imagesFile[i].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err2, result2) => {
                                            if (err2) {
                                                console.log(err2)
                                                return res.send({ response_code: 500, response_message: 'Internal server error' })
                                            } else {
                                                var obj = {};
                                                obj.image = result2.secure_url;
                                                arrFiles.push(obj);
                                                if (arrFiles.length == files.imagesFile.length) {
                                                    User.findByIdAndUpdate({ _id: result._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err3, result3) => {
                                                        if (err3) {
                                                            console.log(err3);
                                                        } else {
                                                            console.log("Images updated successfully");
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                        delete (fields.imagesFile);
                        if (files.govtIdImage1) {
                            cloudinary.v2.uploader.upload(files.govtIdImage1[0].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err4, result4) => {
                                if (err4) {
                                    console.log(err4)
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    fields.govtIdImage1 = result4.secure_url;
                                    User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err5, result5) => {
                                        if (err5) {
                                            console.log(err5);
                                        } else {
                                            console.log('social Documents updated successfully')
                                        }
                                    })
                                }
                            })
                        }
                        delete (fields.govtIdImage1);
                        if (files.govtIdImage2) {
                            cloudinary.v2.uploader.upload(files.govtIdImage2[0].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err6, result6) => {
                                if (err6) {
                                    console.log(err6)
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    fields.govtIdImage2 = result6.secure_url;
                                    User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err7, result7) => {
                                        if (err7) {
                                            console.log(err7);
                                        } else {
                                            console.log('social Documents updated successfully')
                                        }
                                    })
                                }
                            })
                        }
                        delete (fields.govtIdImage2);
                        if (files.videosFile != undefined) {
                            User.findByIdAndUpdate({ _id: result._id }, { $set: { videosFile: [] } }, (err11, result11) => {
                                if (err11) {
                                    console.log(err11)
                                } else {
                                    var videoArr = [];
                                    cloudinary.v2.uploader.upload(files.videosFile[0].path, { resource_type: "video" }, (err6, result6) => {
                                        if (err6) {
                                            console.log(err)
                                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                                        } else {
                                            var obj = {};
                                            obj.video = result6.secure_url;
                                            videoArr.push(obj);
                                            if (videoArr.length == files.videosFile.length) {
                                                User.findByIdAndUpdate({ _id: result._id }, { $push: { videosFile: videoArr } }, { new: true }, (err7, result7) => {
                                                    if (err7) {
                                                        console.log(err7);
                                                    } else {
                                                        console.log("Videos updated successfully");
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                            })
                        }
                        delete (fields.videosFile);
                        fields.createdAt = new Date()
                        User.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err8, result8) => {
                            if (err8) {
                                console.log(err8);
                            } else {
                                var timestamp1 = new Date().getTime();
                                var timestamp2 = result8.createdAt.getTime();
                                var difference = timestamp1 - timestamp2
                                var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                                result8.remainingDays = daysDifference;
                                result8.save((err9, result9) => {
                                    if (err9) {
                                        console.log(err9)
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        return res.send({ response_code: 200, response_message: "Profile updated successfully", Data: result9 });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        });
    },

    viewedBusinessProfessional: (req, res) => {
        if (!req.body.profbusId) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'profbusId is required' })
        } else {
            console.log(req.body)
            User.findOne({ _id: req.body.profbusId }, (err, result) => {
                if (err) {
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (!result) {
                    return res.send({ response_code: 401, response_message: "userId is incorrect" });
                } else {
                    var arr = [];
                    arr.push({ image: result.profileImage })
                    result.imagesFile.map(val => arr.push({ image: val.image }))
                    User.update({ _id: req.body.profbusId }, { $inc: { counter: 1 } }, { upsert: true }, function (err, response) {
                        if (err) {
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else {
                            if (req.body.type == 'professional') {
                                Property.find({ professionalUserId: req.body.profbusId }, (err2, result2) => {
                                    if (err2) {
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        var data = JSON.stringify(result)
                                        var data2 = JSON.parse(data)
                                        if (data2.likeUserId.length > 0) {
                                            var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                            console.log('index', index)
                                            if (index != -1) {
                                                data2.likedStatus = 'yes'
                                            } else {
                                                data2.likedStatus = 'no'
                                            }
                                        } else {
                                            data2.likedStatus = 'no'
                                        }
                                        var query = { $and: [{ "Type": 'professional' }, { "userId": req.body.businessUserId }] }
                                        User.findOne(query, (err3, result3) => {
                                            if (err3) {
                                                console.lgo(err3)
                                            } else if (!result3) {
                                                var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                User.findOne(query1, (err4, result4) => {
                                                    if (err4) {
                                                        console.lgo(err3)
                                                    } else if (!result4) {
                                                        data2.imagesFile = arr
                                                        data2.professionalProfileExists = false
                                                        data2.totalPropertyCreated = result2.length
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    } else {
                                                        data2.imagesFile = arr
                                                        data2.commanUserBusinessId = result4._id
                                                        data2.businessProfileExists = true
                                                        data2.totalPropertyCreated = result2.length
                                                        console.log('Details found successfully')
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    }
                                                })
                                            } else {
                                                var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                User.findOne(query1, (err4, result4) => {
                                                    if (err4) {
                                                        console.lgo(err3)
                                                    } else if (!result4) {
                                                        data2.imagesFile = arr
                                                        data2.professionalProfileExists = true
                                                        data2.commanUserProfessionalId = result3._id
                                                        data2.totalPropertyCreated = result2.length
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    } else {
                                                        data2.imagesFile = arr
                                                        data2.commanUserProfessionalId = result3._id
                                                        data2.commanUserBusinessId = result4._id
                                                        data2.professionalProfileExists = true
                                                        data2.businessProfileExists = true
                                                        data2.totalPropertyCreated = result2.length
                                                        console.log('Details found successfully')
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    }
                                                })
                                            }
                                        })

                                        // data2.professionalProfile = true
                                        // data2.totalPropertyCreated = result2.length
                                        // console.log('Details found successfully')
                                        // return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });

                                    }
                                })
                            } else if (req.body.type == 'business') {
                                Property.find({ userId: req.body.businessUserId }, (err2, result2) => {
                                    if (err2) {
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        var data = JSON.stringify(result)
                                        var data2 = JSON.parse(data)
                                        if (data2.likeUserId.length > 0) {
                                            var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                            console.log('index', index)
                                            if (index != -1) {
                                                data2.likedStatus = 'yes'
                                            } else {
                                                data2.likedStatus = 'no'
                                            }
                                        } else {
                                            data2.likedStatus = 'no'
                                        }
                                        var query = { $and: [{ "Type": 'professional' }, { "userId": req.body.businessUserId }] }
                                        User.findOne(query, (err3, result3) => {
                                            if (err3) {
                                                console.lgo(err3)
                                            } else if (!result3) {
                                                var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                User.findOne(query1, (err4, result4) => {
                                                    if (err4) {
                                                        console.lgo(err3)
                                                    } else if (!result4) {
                                                        data2.imagesFile = arr
                                                        data2.professionalProfileExists = false
                                                        data2.totalPropertyCreated = result2.length
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    } else {
                                                        data2.imagesFile = arr
                                                        data2.commanUserBusinessId = result4._id
                                                        data2.businessProfileExists = true
                                                        data2.totalPropertyCreated = result2.length
                                                        console.log('Details found successfully')
                                                        return res.send({ response_code: 200, response_message: "zDetails found successfully", Data: data2 });
                                                    }
                                                })
                                            } else {
                                                var query1 = { $and: [{ "Type": 'business' }, { "userId": req.body.businessUserId }] }
                                                User.findOne(query1, (err4, result4) => {
                                                    if (err4) {
                                                        console.lgo(err4)
                                                    } else if (!result4) {
                                                        data2.imagesFile = arr
                                                        data2.professionalProfileExists = true
                                                        data2.commanUserProfessionalId = result3._id
                                                        data2.totalPropertyCreated = result2.length
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    } else {
                                                        data2.imagesFile = arr
                                                        data2.commanUserProfessionalId = result3._id
                                                        data2.commanUserBusinessId = result4._id
                                                        data2.businessProfileExists = true
                                                        data2.professionalProfileExists = true
                                                        data2.totalPropertyCreated = result2.length
                                                        console.log('Details found successfully')
                                                        return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                                    }
                                                })
                                            }
                                        })
                                        // data2.totalPropertyCreated = result2.length
                                        // console.log('Details found successfully')
                                        // return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                                    }
                                })
                            } else {
                                var data = JSON.stringify(result)
                                var data2 = JSON.parse(data)
                                if (data2.likeUserId.length > 0) {
                                    var index = data2.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        data2.likedStatus = 'yes'
                                    } else {
                                        data2.likedStatus = 'no'
                                    }
                                } else {
                                    data2.likedStatus = 'no'
                                }
                                console.log('Details found successfully')
                                return res.send({ response_code: 200, response_message: "Details found successfully", Data: data2 });
                            }

                        }
                    });
                    // return res.send({ response_code: 200, response_message: "Details found successfully", Data: result});

                }
            })
        }
    },

    deleteBusinessProfessionalProfile: (req, res) => {
        if (!req.body.userId) {
            console.log('userId is required')
            return res.send({ response_code: 401, response_message: 'userId is required' })
        } else {
            console.log('delete', req.body)
            User.findOne({ _id: req.body.userId }, (err1, result1) => {
                if (err1) {
                    console.log(err1)
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (!result1) {
                    return res.send({ response_code: 401, response_message: "userId is incorrect" });
                } else {
                    User.findOne({ _id: req.body._id }, (err2, result2) => {
                        if (err2) {
                            console.log(err2)
                            return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                        } else {
                            console.log(result2)
                            if (result2.Type == 'professional') {
                                Property.update({ professionalUserId: req.body._id }, { $unset: { "professionalUserId": 1 } }, (err, result) => {
                                    if (err) {
                                        return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                                    } else if (!result) {
                                        User.findOneAndRemove({ _id: req.body._id }, (err3, result3) => {
                                            if (err3) {
                                                console.log(err3)
                                                return res.send({ response_code: 500, response_message: "Internal server error" });
                                            } else if (!result3) {
                                                console.log("Id is incorrect");
                                            } else {
                                                User.findByIdAndUpdate({ "_id": req.body.userId }, { $set: { "professionalProfile": false } }, { new: true }, (err4, result4) => {
                                                    if (err4) {
                                                        console.log(err4);
                                                    } else {
                                                        console.log('status chaged', result4);
                                                        return res.send({ response_code: 200, response_message: "Professional Profile deleted successfully", data: result4 });
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        User.findOneAndRemove({ _id: req.body._id }, (err3, result3) => {
                                            if (err3) {
                                                console.log(err3)
                                                return res.send({ response_code: 500, response_message: "Internal server error" });
                                            } else if (!result3) {
                                                console.log("Id is incorrect");
                                            } else {
                                                User.findByIdAndUpdate({ "_id": req.body.userId }, { $set: { "professionalProfile": false } }, { new: true }, (err4, result4) => {
                                                    if (err4) {
                                                        console.log(err4);
                                                    } else {
                                                        console.log('status chaged', result4);
                                                        return res.send({ response_code: 200, response_message: "Professional Profile deleted successfully", data: result4 });
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            else if (result2.Type == 'business') {
                                User.findOneAndRemove({ _id: req.body._id }, (err1, result1) => {
                                    if (err1) {
                                        console.log(err1)
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else if (!result1) {
                                        console.log("Id is incorrect");
                                    } else {
                                        User.findByIdAndUpdate({ "_id": req.body.userId }, { $set: { "businessProfile": false } }, { new: true }, (error2, result2) => {
                                            if (error2) {
                                                console.log(error2)
                                            } else {
                                                console.log('else status chaged', result2);
                                                return res.send({ response_code: 200, response_message: "Business Profile deleted successfully", data: result2 });
                                            }
                                        })
                                    }
                                })
                            } else {
                                User.findByIdAndUpdate({ "_id": req.body.userId }, { $set: { "professionalProfile": false, "businessProfile": false } }, { new: true }, (err4, result4) => {
                                    if (err4) {
                                        console.log(err4);
                                        return res.send({ response_code: 500, response_message: "Internal server error" });
                                    } else {
                                        console.log('status chaged', result4);
                                        return res.send({ response_code: 200, response_message: "Profile deleted successfully", data: result4 });
                                    }
                                })
                            }

                        }
                    })
                }
            })

        }
    },

    updateUserDays: (req, res) => {
        User.find({}, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result.length == 0) {
                console.log('Data not found')
                return res.send({ response_code: 401, response_message: "Data not found", Data: result });
            } else {
                result.forEach((result2, i) => {
                    var timestamp1 = new Date().getTime();
                    var timestamp2 = result2.created.getTime();
                    var difference = timestamp1 - timestamp2;
                    var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                    result2.remainingDays = daysDifference;
                    result2.save(function (err, user) {
                        if (err) {
                            console.log('error')
                        } else {
                            if (user.remainingDays >= 90) {
                                user.status = 'inactive'
                                result2.save(function (err1, user1) {
                                    if (err1) {
                                        console.log('err1')
                                    } else {
                                        console.log('user status changed')
                                    }
                                })
                            }
                        }
                    });
                })
            }
        })
    },


    professionalPropertyListing: (req, res) => {
        if (req.body.professionalId) {
            Property.find({ professionalUserId: req.body.professionalId }).populate('professionalUserId').exec((err, result) => {
                if (err) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result.length == 0) {
                    return res.send({ response_code: 200, response_message: 'Professional Property Listing found', Data: [] })
                } else {
                    var data = JSON.stringify(result)
                    var data2 = JSON.parse(data)
                    var resultCustome = data2.map(it => {
                        it.mobileNumber = it.userId.mobileNumber
                        it.countryCode = it.userId.countryCode
                        it.professionalUserId = it.professionalUserId._id
                        if (it.likeUserId.length > 0) {
                            var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                            console.log('index', index)
                            if (index != -1) {
                                it.likedStatus = 'yes'
                            } else {
                                it.likedStatus = 'no'
                            }
                            return it
                        }
                        it.likedStatus = 'no'
                        return it
                    })
                    return res.send({ response_code: 200, response_message: 'Professional Property Listing found', Data: resultCustome })
                }
            })
        } else {
            Property.find({ userId: req.body.normalId }).populate('userId').exec((err, result) => {
                if (err) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (result.length == 0) {
                    return res.send({ response_code: 200, response_message: 'Professional Property Listing found', Data: [] })
                } else {
                    var data = JSON.stringify(result)
                    var data2 = JSON.parse(data)
                    var resultCustome = data2.map(it => {
                        it.mobileNumber = it.userId.mobileNumber
                        it.countryCode = it.userId.countryCode
                        it.userId = it.userId._id
                        if (it.likeUserId.length > 0) {
                            var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                            console.log('index', index)
                            if (index != -1) {
                                it.likedStatus = 'yes'
                            } else {
                                it.likedStatus = 'no'
                            }
                            return it
                        }
                        it.likedStatus = 'no'
                        return it
                    })
                    return res.send({ response_code: 200, response_message: 'Property Listing found', Data: resultCustome })
                }
            })
        }


        // var query = {$and: [{ "Type" : { $eq: 'professional' } }, { "userId": req.body.userId } ]}
        // User.find(query)
        // .then(data => {
        //     Property.find({userId: req.body.userId})
        //     .then(data1 => {
        //         var result = data.concat(data1)
        //         return res.send({response_code: 200, response_message: 'Professional Property Listing found', Data: result })
        //     }, error => {
        //         return res.send({response_code: 200, response_message: 'Professional Property Listing found', Data: data})
        //     })
        // }, error => {
        //     return res.send({response_code: 500, response_message: 'Internal server error'})
        // }) 
    },

    sortTotalPostedProperty: (req, res) => {
        if (req.body.professionalUserId) {
            var query = { professionalUserId: req.body.professionalUserId }
            if (req.body.lowtohighPrice) {
                if (req.body.userId) {
                    Property.find(query).sort({ totalPrice: 1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ totalPrice: 1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else if (req.body.hightolowPrice) {
                if (req.body.userId) {
                    Property.find(query).sort({ totalPrice: -1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ totalPrice: -1 }).exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 401, response_message: 'property not found', Data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else if (req.body.lowtohighSize) {
                if (req.body.userId) {
                    Property.find(query).sort({ builtSize: 1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 401, response_message: 'property not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ builtSize: 1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 401, response_message: 'property not found', Data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else if (req.body.hightolowSize) {
                if (req.body.userId) {
                    Property.find(query).sort({ builtSize: -1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ builtSize: -1 }).populate('professionalUserId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else {
                console.log('fields are required')
                return res.send({ response_code: 401, response_message: 'fields are required' })
            }
        } else if (req.body.normalUserId) {
            var query = { userId: req.body.normalUserId }
            if (req.body.lowtohighPrice) {
                if (req.body.userId) {
                    Property.find(query).sort({ totalPrice: 1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ totalPrice: 1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else if (req.body.hightolowPrice) {
                if (req.body.userId) {
                    Property.find(query).sort({ totalPrice: -1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ totalPrice: -1 }).exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 401, response_message: 'property not found', Data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else if (req.body.lowtohighSize) {
                if (req.body.userId) {
                    Property.find(query).sort({ builtSize: 1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 401, response_message: 'property not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ builtSize: 1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 401, response_message: 'property not found', Data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else if (req.body.hightolowSize) {
                if (req.body.userId) {
                    Property.find(query).sort({ builtSize: -1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                        } else {
                            var data = JSON.stringify(result)
                            var data2 = JSON.parse(data)
                            var resultCustome = data2.map(it => {
                                it.mobileNumber = it.userId.mobileNumber
                                it.countryCode = it.userId.countryCode
                                it.userId = it.userId._id
                                if (it.likeUserId.length > 0) {
                                    var index = it.likeUserId.map(it => { return it.userId }).indexOf(req.body.userId)
                                    console.log('index', index)
                                    if (index != -1) {
                                        it.likedStatus = 'yes'
                                    } else {
                                        it.likedStatus = 'no'
                                    }
                                    return it
                                }
                                it.likedStatus = 'no'
                                return it
                            })
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: resultCustome });
                        }
                    });
                } else {
                    Property.find(query).sort({ builtSize: -1 }).populate('userId').exec((err, result) => {
                        if (err) {
                            console.log(err)
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        } else if (result.length == 0) {
                            console.log('property not found');
                            return res.send({ response_code: 200, response_message: 'property not found', Data: [] })
                        } else {
                            console.log('Properties list found successfully')
                            return res.send({ response_code: 200, response_message: "Properties list found successfully", Data: result });
                        }
                    });
                }
            } else {
                console.log('fields are required')
                return res.send({ response_code: 401, response_message: 'fields are required' })
            }
        } else {
            return res.send({ response_code: 401, response_message: 'Normal/Professional id required' })
        }
    },

    updateProperty: (req, res) => {
        var form = new multiparty.Form();
        form.parse(req, function (err, fields, files) {
            if (err) {
                console.log(err);
                return res.send({ response_code: 500, response_message: "Unsupported content-type" });
            } else {
                User.findOne({ _id: fields.userId }, (err8, result8) => {
                    if (err8) {
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else if (!result8) {
                        return res.send({ response_code: 401, response_message: "userId is required" });
                    } else {
                        Property.findOne({ _id: fields.propertyId }, (error, result) => {
                            if (error) {
                                console.log(error);
                                return res.send({ response_code: 500, response_message: "Internal server error" });
                            } else if (!result) {
                                console.log('Property Id is not correct')
                                return res.send({ response_code: 401, response_message: 'Property Id is not correct' })
                            } else {
                                if (files.imagesFile) {
                                    Property.findByIdAndUpdate({ _id: result._id }, { $set: { imagesFile: [] } }, (err10, result10) => {
                                        if (err10) {
                                            console.log(err10)
                                        } else {
                                            console.log('blank array')
                                            var arrFiles = [];
                                            for (var i = 0; i < files.imagesFile.length; i++) {
                                                cloudinary.v2.uploader.upload(files.imagesFile[i].path, { transformation: [{ resource_type: "image" }, { quality: "auto" }] }, (err1, result1) => {
                                                    if (err1) {
                                                        console.log(err1)
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        var obj = {};
                                                        obj.image = result1.secure_url;
                                                        arrFiles.push(obj);
                                                        if (arrFiles.length == files.imagesFile.length) {
                                                            Property.findByIdAndUpdate({ _id: result._id }, { $push: { imagesFile: arrFiles }, }, { new: true }, (err2, result2) => {
                                                                if (err2) {
                                                                    console.log(err2);
                                                                }
                                                                else {
                                                                    console.log("Images updated successfully", result2);
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                            }
                                        }
                                    })
                                }
                                if (files.videosFile) {
                                    Property.findByIdAndUpdate({ _id: result._id }, { $set: { videosFile: [] } }, (err11, result11) => {
                                        if (err11) {
                                            console.log(err11)
                                        } else {
                                            var videoArr = [];
                                            cloudinary.v2.uploader.upload(files.videosFile[0].path, {
                                                resource_type: "video", chunk_size: 6000000,
                                                eager: [
                                                    { width: 300, height: 300, crop: "pad", audio_codec: "none" },
                                                    { width: 160, height: 100, crop: "crop", gravity: "south", audio_codec: "none" }], eager_async: true
                                            },
                                                (err3, result3) => {
                                                    if (err3) {
                                                        console.log(err3)
                                                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                                                    } else {
                                                        var obj = {};
                                                        obj.video = result3.secure_url;
                                                        videoArr.push(obj);
                                                        if (videoArr.length == files.videosFile.length) {
                                                            Property.findByIdAndUpdate({ _id: result._id }, { $push: { videosFile: videoArr } }, { new: true }, (err4, result4) => {
                                                                if (err4) {
                                                                    console.log(err4);
                                                                } else {
                                                                    console.log("Videos updated successfully", result4);
                                                                }
                                                            })
                                                        }
                                                    }
                                                })
                                        }
                                    })
                                }
                                fields.currency = result8.currency
                                fields.propertyId = result._id
                                fields.totalPrice = fields.totalPriceSale ? fields.totalPriceSale : fields.totalPriceRent,
                                    fields.balcony = (fields.balcony == "true") ? true : false,
                                    fields.garden = (fields.garden == "true") ? true : false,
                                    fields.parking = (fields.parking == "true") ? true : false,
                                    fields.modularKitchen = (fields.modularKitchen == "true") ? true : false,
                                    fields.store = (fields.store == "true") ? true : false,
                                    fields.lift = (fields.lift == "true") ? true : false,
                                    fields.duplex = (fields.duplex == "true") ? true : false,
                                    fields.furnished = (fields.furnished == "true") ? true : false,
                                    fields.aircondition = (fields.aircondition == "true") ? true : false,
                                    fields.createdAt = new Date(),
                                    Property.findByIdAndUpdate({ _id: result._id }, fields, { new: true }, (err5, result5) => {
                                        if (err5) {
                                            console.log(err5);
                                            return res.send({ response_code: 500, response_message: "Internal server error" });
                                        } else {
                                            var timestamp1 = new Date().getTime();
                                            var timestamp2 = result5.createdAt.getTime();
                                            var difference = timestamp1 - timestamp2
                                            var daysDifference = Math.floor(difference / 1000 / 60 / 60 / 24);
                                            result5.remainingDays = daysDifference;
                                            result5.save((err6, result6) => {
                                                if (err6) {
                                                    console.log(err6)
                                                    return res.send({ response_code: 500, response_message: "Internal server error" });
                                                } else {
                                                    return res.send({ response_code: 200, response_message: "Property updated successfully", Data: result6 });
                                                }
                                            })
                                        }
                                    })
                            }
                        })
                    }
                })

            }
        })
    },

    deleteProperty: (req, res) => {
        if (!req.body.propertyId) {
            console.log('propertyId is required');
            return res.send({ response_code: 401, response_message: 'propertyId is required' })
        } else {
            Property.findOneAndRemove({ _id: req.body.propertyId }, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('propertyId is incorrect')
                    return res.send({ response_code: 200, response_message: 'propertyId is incorrect' })
                } else {
                    console.log('Property deleted successfully')
                    return res.send({ response_code: 200, response_message: 'Property deleted successfully' })
                }
            })
        }
    },

    appRating: (req, res) => {
        console.log(req.body)
        if (!req.body.userId) {
            console.log('userId Id is required')
            return res.send({ response_code: 401, response_message: 'userId Id is required' })
        } else {
            User.findOneAndUpdate({ _id: req.body.userId }, { $set: { rating: req.body.rating } }, { new: true }, (error, result) => {
                if (error) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('userId is not correct')
                    return res.send({ response_code: 401, response_message: 'userId is not correct' })
                } else {
                    console.log('Rated successfully', result);
                    return res.send({ response_code: 200, response_message: "Rated successfully", data: result });
                }
            })
        }
    },

    appSetting: (req, res) => {
        if (!req.body.userId) {
            console.log('userId Id is required')
            return res.send({ response_code: 401, response_message: 'userId Id is required' })
        } else {
            var query = { $and: [{ "Type": "normal" }, { _id: req.body.userId }] }
            User.findOne(query, (error, result) => {
                if (error) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('userId is not correct')
                    return res.send({ response_code: 401, response_message: 'userId is not correct' })
                } else {
                    console.log('settings details successfully');
                    return res.send({ response_code: 200, response_message: "User details found successfully", Data: result });
                }
            })
        }
    },

    updateSetting: (req, res) => {
        if (!req.body.userId) {
            console.log('userId Id is required')
            return res.send({ response_code: 401, response_message: 'userId Id is required' })
        } else {
            User.findOneAndUpdate({ _id: req.body.userId }, req.body, { new: true }, (error, result) => {
                if (error) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('userId is not correct')
                    return res.send({ response_code: 401, response_message: 'userId is not correct' })
                } else {
                    console.log('settings updated successfully');
                    return res.send({ response_code: 200, response_message: "Settings updated successfully", Data: result });
                }
            })
        }
    },

    notificationSetting: (req, res) => {
        if (!req.body.userId || !req.body.notification) {
            console.log('userId Id & notification required')
            return res.send({ response_code: 401, response_message: 'userId & notification required' })
        } else {
            User.findOneAndUpdate({ _id: req.body.userId }, { $set: { notification: req.body.notification } }, { new: true }, (err, result) => {
                if (err) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('userId is not correct')
                    return res.send({ response_code: 401, response_message: 'userId is not correct' })
                } else {
                    console.log('notification updated successfully');
                    return res.send({ response_code: 200, response_message: "Notification updated successfully", Data: result });
                }
            })
        }
    },

    contactAdmin: (req, res) => {
        if (!req.body.reason || !req.body.details || !req.body.userId) {
            console.log('All Fields are required')
            return res.send({ response_code: 401, response_message: 'All Fields are required' })
        } else {
            let reportObj = new Report({
                "userId": req.body.userId,
                "reason": req.body.reason,
                "details": req.body.details
            });
            reportObj.save((err, result) => {
                if (err) {
                    console.log('error is', err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    console.log('Report posted successfully');
                    return res.send({ response_code: 200, response_message: 'Report posted successfully', Data: result })
                }
            });
        }
    },

    replyAdmin: (req, res) => {
        if (!req.body.userId) {
            console.log('userId is required')
            return res.send({ response_code: 401, response_message: 'userId is required' })
        } else {
            let reportObj = new UserQuery({
                "userId": req.body.userId,
                "reply": req.body.reply,
            });
            reportObj.save((err, result) => {
                if (err) {
                    console.log('error is', err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    console.log('Report posted successfully');
                    return res.send({ response_code: 200, response_message: 'Admin messaged successfully', Data: result })
                }
            });
        }
    },

    getAdminContactDetails: (req, res) => {
        if (!req.body.userId) {
            console.log('All Fields are required')
            return res.send({ response_code: 401, response_message: 'All Fields are required' })
        } else {
            console.log('get admin details')
            Report.find({ userId: req.body.userId })
                .then(data => {
                    console.log(data)
                    UserQuery.find({ userId: req.body.userId })
                        .then(data2 => {
                            var result = data.concat(data2);
                            return res.send({ response_code: 200, response_message: "All Data found successfully", Data: result });
                        }, error => {
                            return res.send({ response_code: 500, response_message: "Internal server error" });
                        })
                }, error => {
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                })
        }
    },

    getRoomId: (req, res) => {
        if (!req.body.sender_id || !req.body.receiver_id) {
            console.log('sender_id and receiver_id are required')
            return res.send({ response_code: 401, response_message: 'sender_id and receiver_id are required' })
        } else {
            var query = { $and: [{ "sender_id": req.body.sender_id }, { "receiver_id": req.body.receiver_id }] }
            Room.findOne(query, (error, result) => {
                if (error) {
                    console.log('Internal server error')
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('sender_id and receiver_id are required')
                    return res.send({ response_code: 401, response_message: 'sender_id and receiver_id are incorrect' })
                } else {
                    console.log('Roomid found successfully', result);
                    return res.send({ response_code: 200, response_message: "Roomid found successfully", data: result });
                }
            })
        }
    },

    createPropertyCategory: (req, res) => {
        var propcategoryObj = new PropertyCategory({
            "name": req.body.name
        })
        propcategoryObj.save((err, result) => {
            if (err) {
                console.log(err);
                return res.send({ response_code: 500, status: "failure", response_message: 'Internal server error' })
            }
            else {
                console.log('Property category created');
                return res.send({ response_code: 200, status: "success", response_message: 'Property category created', data: result })
            }
        })
    },

    propertyCategoryListing: (req, res) => {
        PropertyCategory.find({}, (err, result) => {
            if (err) {
                console.log(err);
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                return res.send({ response_code: 200, response_message: 'property category not found', data: [] })
            } else {
                return res.send({ response_code: 200, response_message: 'property category list found', data: result })
            }
        })
    },

    createCategory: (req, res) => {
        console.log(req.body)
        let categoryObj = new Category({
            "name": req.body.name
        });
        categoryObj.save((err, result) => {
            if (err) {
                console.log(err);
                return res.send({ response_code: 500, status: "failure", response_message: 'Internal server error' })
            }
            else {
                console.log('category created');
                return res.send({ response_code: 200, status: "success", response_message: 'category created successfully', data: result })
            }
        })
    },

    createSubcategory: (req, res) => {
        let subcategoryObj = new Subcategory({
            "name": req.body.name,
            "categoryId": req.body.categoryId
        });
        subcategoryObj.save((err, result) => {
            if (err) {
                console.log(err);
                return res.send({ response_code: 500, status: "failure", response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('Data not found');
                return res.send({ response_code: 401, status: "failure", response_message: 'Data not found' })
            } else {
                console.log('cateory created');
                return res.send({ response_code: 200, status: "success", response_message: 'Sub cateory created', data: result })
            }
        })
    },

    categoryList: (req, res) => {
        Category.find({}, (err, result) => {
            if (err) {
                console.log(err);
                return res.send({ response_code: 500, status: "failure", response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('category not found');
                return res.send({ response_code: 401, status: "failure", response_message: 'category not found' })
            } else {
                console.log('category list found');
                return res.send({ response_code: 200, status: "success", response_message: 'category list found', data: result })
            }
        })
    },

    subcategoryList: (req, res) => {
        Subcategory.find({ "categoryId": req.body.categoryId }).populate('categoryId').exec((err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, status: "failure", response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('subcategory not found');
                return res.send({ response_code: 401, status: "failure", response_message: 'subcategory not found', data: result })
            } else {
                console.log('subcategory list found');
                return res.send({ response_code: 200, status: "success", response_message: 'subcategory list found', data: result })
            }
        })
    },

    allSubcategory: (req, res) => {
        Subcategory.find({}, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, status: "failure", response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('subcategory not found');
                return res.send({ response_code: 401, status: "failure", response_message: 'subcategory not found', data: result })
            } else {
                console.log('subcategory list found');
                return res.send({ response_code: 200, status: "success", response_message: 'subcategory list found', data: result })
            }
        })
    },

    editCategory: (req, res) => {
        if (!req.body.categoryId) {
            console.log('categoryId is required')
            return res.json({ response_code: 401, response_message: 'categoryId is required' })
        } else {
            Category.findOneAndUpdate({ _id: req.body.categoryId }, req.body, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                } else if (!result) {
                    console.log('categoryId is incorrect');
                    return res.send({ response_code: 401, status: "failure", response_message: 'categoryId is incorrect' })
                } else {
                    console.log('Category updated successfully')
                    return res.send({ response_code: 200, status: "success", response_message: "Category updated successfully", Data: result });
                }
            })
        }
    },

    editSubcategory: (req, res) => {
        console.log(req.body)
        if (!req.body.subcategoryId) {
            console.log('subcategoryId is required')
            return res.json({ response_code: 401, response_message: 'subcategoryId is required' })
        } else {
            Subcategory.findOneAndUpdate({ _id: req.body.subcategoryId }, req.body, { new: true }, (err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                } else if (!result) {
                    console.log('Subcategory is incorrect');
                    return res.send({ response_code: 401, status: "failure", response_message: 'categoryId is incorrect' })
                } else {
                    // console.log('Subcategory updated successfully')
                    console.log('Subcategory updated successfully', result)
                    return res.send({ response_code: 200, status: "success", response_message: "Subcategory updated successfully", Data: result });
                }
            })
        }
    },

    getDetailsSubcategory: (req, res) => {
        console.log('sub cat', req.body)
        if (!req.body.subcategoryId) {
            console.log('subcategoryId is required')
            return res.json({ response_code: 401, response_message: 'subcategoryId is required' })
        } else {
            Subcategory.findOne({ _id: req.body.subcategoryId }).populate("categoryId").exec((err, result) => {
                if (err) {
                    console.log(err)
                    return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
                } else if (!result) {
                    console.log('Subcategory is incorrect');
                    return res.send({ response_code: 401, status: "failure", response_message: 'categoryId is incorrect' })
                } else {
                    // console.log('Subcategory updated successfully')
                    console.log('Subcategory found successfully', result)
                    return res.send({ response_code: 200, status: "success", response_message: "Subcategory details found successfully", Data: result });
                }
            })
        }
    },

    deleteCategory: (req, res) => {
        Category.findOneAndRemove({ _id: req.params.categoryId }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
            } else if (!result) {
                console.log('categoryId is incorrect');
                return res.send({ response_code: 401, status: "failure", response_message: 'categoryId is incorrect' })
            } else {
                console.log('category deleted successfully')
                return res.send({ response_code: 200, status: "success", response_message: "category deleted successfully" });
            }
        })
    },

    deleteSubcategory: (req, res) => {
        Subcategory.findOneAndRemove({ _id: req.params.subcategoryId }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" });
            } else if (!result) {
                console.log('subcategoryId is incorrect');
                return res.send({ response_code: 401, status: "failure", response_message: 'subcategoryId is incorrect' })
            } else {
                console.log('subcategory deleted successfully')
                return res.send({ response_code: 200, status: "success", response_message: "subcategory deleted successfully" });
            }
        })
    },

    chatUserList: (req, res) => {
        console.log('chat user list====================>', req.body)

        Room.find({ "sender_id": ObjectId(req.body.userId) }).populate('receiver_id').exec((err, result) => {
            // Room.find(query).populate('receiver_id').exec((err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result.length == 0) {
                console.log('No chat users found');
                return res.send({ response_code: 200, response_message: 'No chat users found', Data: [] })
            } else {
                console.log('==============result', result)
                console.log('inshad Ansari 2', JSON.stringify(result))
                // result.fullName= result.receiver_id.fullName
                // result.profileImage= result.receiver_id.profileImage
                // result.receiver_id= result.receiver_id._id
                var data = JSON.stringify(result)
                var data2 = JSON.parse(data)
                var resultCustome = data2.map(it => {
                    it.fullName = it.receiver_id.fullName
                    it.profileImage = it.receiver_id.profileImage
                    it.receiver_id = it.receiver_id._id
                    return it
                })
                console.log(result)
                return res.send({ response_code: 200, response_message: 'zChat users found', Data: resultCustome })
            }
        })

    },


    chatDetails: (req, res) => {
        console.log(req.body)
        if (!req.body.sender_id || !req.body.room_id) {
            console.log('sender_id & room_id are required')
            return res.json({ response_code: 401, response_message: 'sender_id & room_id are required' })
        } else {
            Chat.find({ "room_id": req.body.room_id }, (err, result) => {
                if (err) {
                    console.log("Error is===========>", err);
                    return res.send({ response_code: 500, response_message: "Internal server error" });
                } else if (result.length == 0) {
                    return res.send({ response_code: 200, response_message: 'No chats found', Data: [] })
                } else {
                    return res.send({ response_code: 200, response_message: "Chats found successfully", Data: result });
                    // socket.emit('chatDetails', { Data: result });
                    // for(var i =0; i< result.length ; i++) {
                    //     if(result[i].delete_sender_id == data.sender_id) {
                    //         console.log('delete_sender_id chat details')
                    //         socket.emit('chatDetails', { Data: [] });

                    //     } else if (result[i].delete_both == data.sender_id){
                    //         console.log('delete_both chat details')
                    //         socket.emit('chatDetails', { Data: [] });
                    //     } else {
                    //         console.log('chat details')
                    //         // console.log(result)
                    //         socket.emit('chatDetails', { Data: result });
                    //     }
                    // }
                }
            })
        }
    },

    chatDelete: (req, res) => {
        if (!req.body.room_id) {
            console.log('room_id are required')
            return res.json({ response_code: 401, response_message: 'room_id are required' })
        } else {
            Chat.deleteMany({ room_id: req.body.room_id }, (err, result) => {
                if (err) {
                    console.log('err')
                } else {
                    Room.deleteMany({ room_id: req.body.room_id }, (err, result) => {
                        if (err) {
                            console.log('err')
                        } else {
                            console.log('delete')
                            return res.json({ response_code: 200, response_message: 'Chat is deleted' })
                        }
                    })
                }
            })
        }
    },

    blockUser: (req, res) => {
        if (!req.body.block_to || !req.body.block_from) {
            console.log('sender_id & room_id are required')
            return res.json({ response_code: 401, response_message: 'sender_id & block_from are required' })
        } else {
            var blockJson = new BlockUser({
                "block_to": req.body.block_to,
                "block_from": req.body.block_from,
            });
            blockJson.save((error2, result2) => {
                if (error2) {
                    console.log("error2 is===========>", error2);
                    return res.json({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    console.log('user blocked')
                    return res.json({ response_code: 200, response_message: 'User is blocked either by sender or receiver' })
                }
            });
        }
    },

    notificationList: (req, res) => {
        if (!req.body.userId) {
            console.log('userId is required')
            return res.json({ response_code: 401, response_message: 'userId is required' })
        } else {
            Notification.find({ "userId": req.body.userId }).sort({ created: -1 }).exec((err, result) => {
                if (err) {
                    console.log("err is===========>", err);
                    return res.json({ response_code: 500, response_message: 'Internal server error' })
                } else if (result.length == 0) {
                    console.log('Notification list not found')
                    return res.json({ response_code: 200, response_message: 'Notification list not found', Data: [] })
                } else {
                    console.log('Notification list found')
                    return res.json({ response_code: 200, response_message: 'Notification list found', Data: result })
                }
            });
        }
    }

}