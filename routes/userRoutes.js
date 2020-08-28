const userRoutes = require('express').Router();
const userController = require('../controllers/userController.js');
userRoutes.get('/getStaticContent', userController.getStaticContent);
userRoutes.post('/getStaticContentByType', userController.getStaticContentByType);
userRoutes.post('/userSignUp', userController.userSignUp);
userRoutes.post('/userSignin', userController.userSignin);
userRoutes.post('/checkUser', userController.checkUser);
userRoutes.post('/checkSignupExist', userController.checkSignupExist);
userRoutes.post('/userSignout', userController.userSignout);
userRoutes.post('/getUserDetails',userController.getUserDetails);
userRoutes.post('/userDeleteProfile',userController.userDeleteProfile);

userRoutes.post('/postProperty',userController.postProperty);
userRoutes.post('/getPropertyDetails',userController.getPropertyDetails);
userRoutes.post('/propertylisting',userController.propertylisting);

userRoutes.post('/getpropertyCategory',userController.getpropertyCategory);
userRoutes.post('/propertySearchByKeywords',userController.propertySearchByKeywords);
userRoutes.post('/searchByGooglePlaceApi',userController.searchByGooglePlaceApi);

userRoutes.get('/allProperty',userController.allProperty);
userRoutes.post('/listDiffProperty',userController.listDiffProperty);
userRoutes.post('/myPropertyInactiveList',userController.myPropertyInactiveList);
userRoutes.get('/updatePropertyDays',userController.updatePropertyDays);

userRoutes.post('/updateParticularProperty',userController.updateParticularProperty);
userRoutes.post('/updateParticularProfile',userController.updateParticularProfile);

userRoutes.post('/totalPropertyOfUser',userController.totalPropertyOfUser);
userRoutes.post('/sortProperty',userController.sortProperty);

userRoutes.post('/recentPost',userController.recentPost);
userRoutes.post('/likedPost',userController.likedPost);
userRoutes.post('/listLikedPost',userController.listLikedPost);
userRoutes.post('/searchBusinessProfessional',userController.searchBusinessProfessional);
userRoutes.post('/searchSaleOrRent',userController.searchSaleOrRent);

userRoutes.post('/createBusinessOrProfessional',userController.createBusinessOrProfessional);
userRoutes.post('/getBusinessOrProfessionalProfile',userController.getBusinessOrProfessionalProfile);

userRoutes.post('/getProfessionalProfile',userController.getProfessionalProfile);


userRoutes.post('/getBusinessOrProfessionalDetails',userController.getBusinessOrProfessionalDetails);

userRoutes.post('/updateNormalProfile',userController.updateNormalProfile);
userRoutes.post('/updateBusinessOrProfessionalProfile',userController.updateBusinessOrProfessionalProfile);

userRoutes.post('/viewedBusinessProfessional',userController.viewedBusinessProfessional);//remove
userRoutes.post('/deleteBusinessProfessionalProfile',userController.deleteBusinessProfessionalProfile);
userRoutes.get('/updateUserDays',userController.updateUserDays);
userRoutes.post('/professionalPropertyListing',userController.professionalPropertyListing);
userRoutes.post('/sortTotalPostedProperty',userController.sortTotalPostedProperty);


userRoutes.post('/updateProperty',userController.updateProperty);
userRoutes.post('/deleteProperty',userController.deleteProperty);
userRoutes.post('/appRating',userController.appRating);
userRoutes.post('/appSetting',userController.appSetting);
userRoutes.post('/updateSetting',userController.updateSetting);
userRoutes.post('/notificationSetting',userController.notificationSetting);
userRoutes.post('/contactAdmin',userController.contactAdmin);
userRoutes.post('/replyAdmin',userController.replyAdmin);
userRoutes.post('/getAdminContactDetails',userController.getAdminContactDetails);

userRoutes.post('/getRoomId',userController.getRoomId);
userRoutes.post('/createPropertyCategory',userController.createPropertyCategory);
userRoutes.get('/propertyCategoryListing',userController.propertyCategoryListing);

userRoutes.post('/createCategory',userController.createCategory);
userRoutes.post('/createSubcategory',userController.createSubcategory);
userRoutes.get('/categoryList',userController.categoryList);
userRoutes.post('/subcategoryList',userController.subcategoryList);
userRoutes.post('/allSubcategory',userController.allSubcategory);
userRoutes.post('/editCategory',userController.editCategory);
userRoutes.post('/editSubcategory',userController.editSubcategory);
userRoutes.post('/getDetailsSubcategory',userController.getDetailsSubcategory);

userRoutes.delete('/deleteCategory/:categoryId',userController.deleteCategory);
userRoutes.delete('/deleteSubcategory/:subcategoryId',userController.deleteSubcategory);

userRoutes.post('/chatUserList',userController.chatUserList);
userRoutes.post('/chatDetails',userController.chatDetails);
userRoutes.post('/blockUser',userController.blockUser);
userRoutes.post('/chatDelete',userController.chatDelete);
userRoutes.post('/notificationList',userController.notificationList);



module.exports = userRoutes;