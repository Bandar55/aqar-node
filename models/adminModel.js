var mongoose = require('mongoose');
var schema = mongoose.Schema;
var bcrypt = require('bcryptjs');
var Admin = new schema({
    name: {
        type: String
    }, 
    email: {
        type: String
    },
    password: {
        type: String
    },
    Type: {
        type: String,
        enum: ['Admin', 'Subadmin'],
        default: 'Admin'
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    jwtToken: {
        type: String
    },
    profilePic: {
        type: String,
    },
    username:{
        type:String
    },
     permission:[{
        name: {
            type: String
        },
        url: {
            type: String
        },
        icon: {
            type: String
        }
    }],
    createdAt: {
        type: Date,
        default: new Date()
    },
    createdAt1: {
        type: Date,
        default: Date.now()
    }
})

const AdminModel = mongoose.model('admin', Admin)
module.exports = AdminModel;

AdminModel.findOne({}, (err, result) => {
    if (err) {
        console.log(err);
    } else {
        if(!result) {
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash("shalini", salt, function(err, hash) {
                    var adminObj = new AdminModel({
                        email: "shalini.gupta@mobulous.com",
                        password: hash,
                        username:"shalini15",
                        name: "Shalini",
                        profilePic: "http://eadb.org/wp-content/uploads/2015/08/profile-placeholder.jpg"
                    });
                    adminObj.save((error, success) => {
                        if(error){
                            console.log("Error in creating admin");
                        }
                        else{
                            console.log("Admin data is==========>",success);
                        }                       
                    })
                });
            })
        }
    }
})