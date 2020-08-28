const Admin = require('../models/adminModel');
const staticModel = require('../models/staticModel');
const Marketing = require('../models/marketingModel');
const User = require('../models/userModel');
const Property = require('../models/propertyModel');
const Currency = require('../models/currencyModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const cloudinary = require('cloudinary');
const LanguageModel = require('../models/languageModel.js');

cloudinary.config({
    cloud_name: 'dfqkwolry',
    api_key: '462474527947692',
    api_secret: 'CWaHDkGydbrGRZ5OATmLr7CVxU4'
});

module.exports = {
    adminLogin: (req, res) => {
        console.log(req.body)
        if (!req.body.email) {
            console.log('Email is required')
            return res.send({ response_code: 401, response_message: 'Internal server error' });
        } else if (!req.body.password) {
            console.log('password is required')
            return res.send({ response_code: 500, response_message: 'Internal server error' });
        } else {
            Admin.findOne({ email: req.body.email }, (err, result) => {
                if (err) {
                    console.log('err is', err)
                    return res.send({ response_code: 500, response_message: 'Internal server error' });
                } else if (!result) {
                    console.log('Email is incorrect')
                    return res.send({ response_code: 401, response_message: 'Email is incorrect' });
                } else {
                    var comparePassword = bcrypt.compareSync(req.body.password, result.password);
                    console.log('commm', comparePassword)
                    if (comparePassword) {
                        var jwtToken = jwt.sign({ "email": req.body.email }, config.jwtSecretKey);
                        console.log('generated token is', jwtToken);
                        Admin.findOneAndUpdate({ _id: result._id }, { $set: { "jwtToken": jwtToken } }, { new: true }, (err1, result1) => {
                            if (err1) {
                                console.log("Internal server error")
                                return res.send({ response_code: 500, status: "failure", response_message: "Internal server error" })
                            } else {
                                console.log("Admin has successfully logged in")
                                return res.send({ response_code: 200, status: "success", response_message: "Admin has logged in successfully", Data: result1 })
                            }
                        })
                    } else {
                        console.log('Password is incorrect')
                        return res.send({ response_code: 401, status: "failure", response_message: 'Password is incorrect' });
                    }
                }
            })
        }
    },

    adminDetails: (req, res) => {
        Admin.findOne({ _id: req.params.adminId }, (err, result) => {
            if (err) {
                console.log('Internal server error');
                return res.send({ response_code: 500, status: "failure", response_message: 'Admin Id is required' });
            } else if (!result) {
                console.log('Admin Id is incorrect');
                return res.send({ response_code: 401, status: "failure", response_message: 'zAdmin Id is incorrect' });
            } else {
                console.log('Admin profile found successfully');
                return res.send({ response_code: 200, status: "success", response_message: 'Admin profile found successfully', Data: result });
            }
        })
    },

    adminChangePassword: (req, res) => {
        if (!req.body.adminId) {
            console.log('adminId is required');
            return res.send({ response_code: 401, response_message: 'adminId is required' })
        } else {
            Admin.findOne({ _id: req.body.adminId }, (err, result) => {
                if (err) {
                    console.log('Internal server error');
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('adminId is incorrect');
                    return res.send({ response_code: 401, response_message: 'adminId is incorrect' })
                } else {
                    console.log(result)
                    var comparePassword = bcrypt.compareSync(req.body.oldPassword, result.password);
                    console.log(comparePassword)
                    if (comparePassword) {
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(req.body.newPassword, salt, function (err, hash) {
                                result.password = hash;
                                result.save((err1, result1) => {
                                    if (err1) {
                                        console.log(err)
                                    } else {
                                        console.log('Admin password changed successfully')
                                        return res.send({ response_code: 200, response_message: 'Admin password changed successfully', Data: result1 })
                                    }
                                })
                            });
                        });
                    } else {
                        console.log('Admin password is incorrect')
                        return res.send({ response_code: 401, response_message: 'Admin password is incorrect' })
                    }
                }
            })
        }
    },

    getUserDetails: (req, res) => {
        if (!req.params.userId) {
            console.log('User Id is required')
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        } else {
            User.findOne({ _id: req.params.userId }, (error, result) => {
                if (error) {
                    console.log(error)
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('User Id is not correct')
                    return res.send({ response_code: 401, response_message: 'User Id is not correct' })
                } else {
                    console.log('User details found successfully')
                    return res.send({ response_code: 200, response_message: "User details found successfully", Data: result });
                }
            })
        }
    },

    blockAndVerifyUser: (req, res) => {
        console.log(req.body)
        if(req.body.status == 'active'){
            User.findOneAndUpdate({ _id: req.body.userId }, { $set: { "status": 'active' } }, { new: true }, (err, result) => {
                if (err) {
                    console.log("Internal server error")
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                } else if (!result) {
                    console.log('User Id is not correct')
                    return res.send({ response_code: 401, response_message: 'User Id is not correct' })
                } else {
                    console.log("User is verified")
                    return res.send({ response_code: 200, response_message: "User has been verified", Data: result })
                }
            })
        } else if(req.body.status == 'inactive'){
            User.findOneAndUpdate({ _id: req.body.userId }, { $set: { "status": 'inactive' } }, { new: true }, (err, result) => {
                if (err) {
                    console.log("Internal server error")
                    return res.send({ response_code: 500, response_message: "Internal server error" })
                } else if (!result) {
                    console.log('User Id is not correct')
                    return res.send({ response_code: 401, response_message: 'User Id is not correct' })
                } else {
                    console.log("User is blocked")
                    return res.send({ response_code: 501, response_message: "User has been blocked", Data: result })
                }
            })
        } else {
            return res.send({ response_code: 401, response_message: 'User Id is required' })
        }
    },

    addContent: (req, res) => {
        var contentObj = {
            'title': req.body.title,
            'description': req.body.description,
            'contentType': req.body.contentType
        }
        staticModel.create(contentObj, (error2, result) => {
            if (error2) {
                console.log(error2);
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else {
                console.log("Static content added successfully.");
                return res.send({ response_code: 200, response_message: 'Static content added successfully.', Data: result })
            }
        })
    },

    getContentDetails: (req, res) => {
        console.log(req.params)
        if (!req.params.contentId) {
            return res.send({ response_code: 500, response_message: "Internal server error" });
        } else {
            staticModel.findOne({ _id: req.params.contentId }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('contentId is incorrect');
                    return res.send({ response_code: 401, response_message: 'contentId is incorrect' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Content details found succesfully.', Data: result })
                }
            })
        }
    },

    editContent: (req, res) => {
        console.log(req.body)
        staticModel.findOneAndUpdate({ _id: req.body._id }, req.body, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (!result) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'contentId is incorrect' })
            } else {
                return res.send({ response_code: 200, response_message: 'Static content updated succesfully.', Data: result })
            }
        })
    },

    deleteContent: (req, res) => {
        console.log(req.params)
        if (!req.params.contentId) {
            return res.send({ response_code: 500, response_message: "Internal server error" });
        } else {
            staticModel.findOneAndRemove({ _id: req.params.contentId }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Static content deleted succesfully.' })
                }
            })
        }
    },

    getMarketingPopup: (req, res) => {
        Marketing.find({}, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                return res.send({ response_code: 401, response_message: 'Marketing popup list not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'Marketing popup list found succesfully.', Data: result })
            }
        })
    },


    getPropertyDetails: (req, res) => {
        console.log(req.params)
        if (!req.params.id) {
            return res.send({ response_code: 401, response_message: "id is required" });
        } else {
            Property.findOne({ _id: req.params.id }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('propertyId is incorrect');
                    return res.send({ response_code: 401, response_message: 'propertyId is incorrect' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Property details found succesfully.', Data: result })
                }
            })
        }
    },

    editProperty: (req, res) => {
        if (!req.body.propertyId) {
            return res.send({ response_code: 401, response_message: "propertyId is required" });
        } else {
            Property.findByIdAndUpdate({ _id: req.body.propertyId }, req.body, { new: true }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('propertyId is incorrect');
                    return res.send({ response_code: 401, response_message: 'propertyId is incorrect' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Property updated succesfully.', Data: result })
                }
            })
        }
    },

    addCurrency: (req, res) => {
        let currencyData = new Currency({
            "countryName": req.body.countryName,
            "countryCode": req.body.countryCode,
            "currencyType": req.body.currencyType,
            "currencyRate": req.body.currencyRate
        })
        currencyData.save((err, result) => {
            if (err) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else {
                return res.send({ response_code: 200, response_message: 'Currency created' })
            }
        })
    },

    currencyList: (req, res) => {
        Currency.find({}, (err, result) => {
            if (err) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                return res.send({ response_code: 401, response_message: 'Currencies list not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'Currencies list found succesfully.', Data: result })
            }
        })
    },

    getCurrencyDetails: (req, res) => {
        Currency.findOne({ _id: req.params.currencyId }, (err, result) => {
            if (err) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (!result) {
                return res.send({ response_code: 401, response_message: 'Currency id is not correct' })
            } else {
                return res.send({ response_code: 200, response_message: 'Currency Data found succesfully.', Data: result })
            }
        })
    },

    editCurrency: (req, res) => {
        Currency.findByIdAndUpdate({ _id: req.body.currencyId }, req.body, { new: true }, (err, result) => {
            if (err) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (!result) {
                return res.send({ response_code: 401, response_message: 'Currency id is not correct' })
            } else {
                return res.send({ response_code: 200, response_message: 'Currency updated succesfully.', Data: result })
            }
        })
    },

    deleteCurrency: (req, res) => {
        if (!req.params.currencyId) {
            return res.send({ response_code: 500, response_message: "Internal server error" });
        } else {
            Currency.findOneAndRemove({ _id: req.params.currencyId }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    return res.send({ response_code: 200, response_message: 'currency deleted succesfully.' })
                }
            })
        }
    },

    createSubadmin: (req, res) => {
        console.log('subadmin', req.body)
		Admin.findOne({ email: req.body.email }, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result) {
                return res.send({ response_code: 501, response_message: 'Email already exists' })
            } else {
            	bcrypt.genSalt(10, function (err, salt) {
		            bcrypt.hash(req.body.password, salt, function (err, hash) {
		                let subadminData = new Admin({
		                    "name": req.body.name,
		                    "email": req.body.email,
		                    "status": "Inactive",
		                    "Type": req.body.Type,
		                    "password": hash,
		                    "permission": req.body.permission
		                })
		                subadminData.save((err, result) => {
		                    if (err) {
		                        console.log(err);
		                        return res.send({ response_code: 500, response_message: 'Internal server error' })
		                    } else {
		                        return res.send({ response_code: 200, response_message: 'Subadmin created succesfully' })
		                    }
		                })
		            });
		        });
            }
        })
    },

    subAdminList: (req, res) => {
        Admin.find({ "Type": "Subadmin" }, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                return res.send({ response_code: 200, response_message: 'subadmin not found', Data: []})
            } else {
                return res.send({ response_code: 200, response_message: 'subadmin found succesfully.', Data: result })
            }
        })
    },

    getSubadminDetails: (req, res) => {
        console.log(req.params)
        if (!req.params.id) {
            return res.send({ response_code: 401, response_message: "id is required" });
        } else {
            Admin.findOne({ _id: req.params.id }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    return res.send({ response_code: 401, response_message: 'id is incorrect' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Subadmin details found succesfully.', Data: result })
                }
            })
        }
    },

    editSubadmin: (req, res) => {
        if (!req.body.id) {
            return res.send({ response_code: 401, response_message: "id is required" });
        } else {
            Admin.findByIdAndUpdate({ _id: req.body.id }, req.body, { new: true }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('Id is incorrect');
                    return res.send({ response_code: 401, response_message: 'id is incorrect' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Subadmin updated succesfully.', Data: result })
                }
            })
        }
    },

    deleteSubadmin: (req, res) => {
        if (!req.params.id) {
            return res.send({ response_code: 401, response_message: "id is required" });
        } else {
            console.log(req.params)
            Admin.findOneAndRemove({ _id: req.params.id }, (err, result) => {
                if (err) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Subadmin deleted succesfully.' })
                }
            })
        }
    },

    getPopupDetails: (req, res) => {
        console.log(req.params)
        if (!req.params.marketingId) {
            return res.send({ response_code: 500, response_message: "Internal server error" });
        } else {
            Marketing.findOne({ _id: req.params.marketingId }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else if (!result) {
                    console.log('marketingId is incorrect');
                    return res.send({ response_code: 401, response_message: 'marketingId is incorrect' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Marketing details found succesfully.', Data: result })
                }
            })
        }
    },

    addMarketingPopup: (req, res) => {
        var marketingObj = {
            'screenName': req.body.screenName,
            'title': req.body.title,
        }
        Marketing.create(marketingObj, (error, result) => {
            if (error) {
                console.log(error);
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else {
                if (req.files.marketingImage) {
                    cloudinary.v2.uploader.upload(req.files.marketingImage.path, { transformation: [{ resource_type: "image" },] }, (err2, result2) => {
                        if (err2) {
                            console.log('errormsg========>', err2)
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else {
                            Marketing.findByIdAndUpdate({ _id: result._id }, { $set: { bannerImage: result2.secure_url } }, { new: true }, (err3, result3) => {
                                if (err3) {
                                    console.log(err3);
                                } else {
                                    console.log("Images updated successfully");
                                }
                            })
                        }
                    })
                }
                console.log("Marketing Popup added successfully.");
                return res.send({ response_code: 200, response_message: 'Marketing Popup added successfully.', Data: result })
            }
        })
    },

    editMarketingPopup: (req, res) => {
        Marketing.findOneAndUpdate({ _id: req.body.id }, { $set: { screenName: req.body.screenName, title: req.body.title } }, (err, result) => {
            if (err) {
                console.log(err)
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (!result) {
                console.log('marketingId is incorrect');
                return res.send({ response_code: 401, response_message: 'marketingId is incorrect' })
            } else {
                if (req.files.marketingImage) {
                    console.log(req.files.marketingImage.path)
                    cloudinary.v2.uploader.upload(req.files.marketingImage.path, { resource_type: 'image' }, (err1, result1) => {
                        if (err1) {
                            console.log(err1)
                            return res.send({ response_code: 500, response_message: 'Internal server error' })
                        } else {
                            Marketing.findOneAndUpdate({ _id: result._id }, { $set: { bannerImage: result1.secure_url } }, { new: true }, (err2, result2) => {
                                if (err2) {
                                    console.log(err2);
                                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                                } else {
                                    return res.send({ response_code: 200, response_message: 'Marketing popup updated successfully', Data: result2 })
                                }
                            })
                        }
                    })
                }
                Marketing.findOneAndUpdate({ _id: result._id }, result.body, { new: true }, (err2, result2) => {
                    if (err2) {
                        console.log(err2);
                        return res.send({ response_code: 500, response_message: 'Internal server error' })
                    } else {
                        return res.send({ response_code: 200, response_message: 'Marketing popup updated successfully', Data: result2 })
                    }
                })

            }
        })
    },

    deletePopup: (req, res) => {
        if (!req.params.marketingId) {
            return res.send({ response_code: 500, response_message: "Internal server error" });
        } else {
            console.log(req.params)
            Marketing.findOneAndRemove({ _id: req.params.marketingId }, (error, result) => {
                if (error) {
                    return res.send({ response_code: 500, response_message: 'Internal server error' })
                } else {
                    return res.send({ response_code: 200, response_message: 'Marketing popup deleted succesfully.' })
                }
            })
        }
    },

    getAllUser: (req, res) => {
        User.find({}, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'Users not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'All users found succesfully.', Data: result })
            }
        })
    },

    totalRegisterUser: (req, res) => {
        User.find({ "Type": "normal" }, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'Users not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'All users found succesfully.', Data: result })
            }
        })
    },

    totalRegisterProfessional: (req, res) => {
        User.find({ "Type": "professional" }, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'Users not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'All users found succesfully.', Data: result })
            }
        })
    },

    totalRegisterBusiness: (req, res) => {
        User.find({ "Type": "business" }, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'Users not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'All users found succesfully.', Data: result })
            }
        })
    },

    getAllProperty: (req, res) => {
        Property.find({}, (error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                return res.send({ response_code: 401, response_message: 'Properties not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'Normal properties found succesfully.', Data: result })
            }
        })   
    },

    getNormalProperty: (req, res) => {
        Property.find({ professionalUserId: { $exists: false}}).populate('userId').exec((error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'Properties not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'Normal properties found succesfully.', Data: result })
            }
        })    
    },

    getProfessionalProperty: (req,res) => {
        Property.find({ professionalUserId: { $exists: true}}).populate('professionalUserId').exec((error, result) => {
            if (error) {
                return res.send({ response_code: 500, response_message: 'Internal server error' })
            } else if (result.length == 0) {
                console.log('contentId is incorrect');
                return res.send({ response_code: 401, response_message: 'Properties not found' })
            } else {
                return res.send({ response_code: 200, response_message: 'Professional properties found succesfully.', Data: result })
            }
        })  
    },




    //=========================================Add language==========================================//

    addLanguage: (req, res) => {
        console.log("Request for add language is============>", req.body);
        if (!req.body.language) {
            return res.send({ response_code: 501, response_message: "Langauge is required" });
        } 
        LanguageModel.findOne({ "language": req.body.language }, (error, result) => {
            if (error) {
                console.log("Error is=========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result) {
                console.log("Langauge alraedy exist");
                return res.send({ response_code: 501, response_message: "Langauge name alraedy exist" });
            } else {
                let obj = new LanguageModel({
                    "language": req.body.language
                })
                obj.save((error1, result1) => {
                    if (error) {
                        console.log("Error 1 is===========>", error1);
                        return res.send({ response_code: 500, response_message: "Internal server error" });
                    } else {
                        console.log("Langauge added successfully", result1);
                        return res.send({ response_code: 200, response_message: "Langauge added successfully", Data: result1 });
                    }
                })
            }
        })
    },

    //============================================get language========================================//

    getLanguage: (req, res) => {
        console.log("get language request is===========>", req.body);
        LanguageModel.findOne({ "_id": req.params.languageId }, (error, result) => {
            if (error) {
                console.log("Error is==========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (!result) {
                console.log("Language Id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            } else {
                console.log("Language details found successfully", result);
                return res.send({ response_code: 200, response_message: "Language details found successfully", Data: result });
            }
        })
    },

    //============================================Update language========================================//

    updateLanguage: (req, res) => {
        console.log("Update language request is===========>", req.body);
		LanguageModel.findOne({ "language": req.body.language }, (error, result) => {
            if (error) {
                console.log("Error is=========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (result) {
                console.log("Langauge alraedy exist");
                return res.send({ response_code: 501, response_message: "Langauge name alraedy exist" });
            } else {
                LanguageModel.findByIdAndUpdate({ "_id": req.body.languageId }, { $set: { "language": req.body.language } }, { new: true }, (error, result) => {
		            if (error) {
		                console.log("Error is==========>", error);
		                return res.send({ response_code: 500, response_message: "Internal server error" });
		            } else if (!result) {
		                console.log("Language Id is incorrect");
		                return res.send({ response_code: 501, response_message: "Something went wrong" });
		            } else {
		                console.log("Language updated successfully", result);
		                return res.send({ response_code: 200, response_message: "Language updated successfully", Data: result });
		            }
		        })
            }
        })
    },

    //==============================================Delete language=====================================//

    deleteLangauge: (req, res) => {
        console.log("Request for delete langauge===========>", req.body);
        LanguageModel.findByIdAndRemove({ "_id": req.body.languageId }, (error, result) => {
            if (error) {
                console.log("Error is=========>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else if (!result) {
                console.log("Language Id is incorrect");
                return res.send({ response_code: 501, response_message: "Something went wrong" });
            } else {
                console.log("Langauge deleted successfully", result);
                return res.send({ response_code: 200, response_message: "Langauge deleted successfully", Data: result });
            }
        })
    },

    //===============================================Get All Language List==============================//

    getAllLanguage: (req, res) => {
        console.log("Request for get language is============>", req.body);
        LanguageModel.find({}, (error, result) => {
            if (error) {
                console.log("Error is=============>", error);
                return res.send({ response_code: 500, response_message: "Internal server error" });
            } else {
                console.log("Language List found successfully");
                res.send({ response_code: 200, response_message: "Language List found successfully", Data: result })
            }
        })
    },




}