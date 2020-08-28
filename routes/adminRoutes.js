const adminRoutes = require('express').Router();
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
const adminController = require('../controllers/adminController.js');
adminRoutes.post('/adminLogin',adminController.adminLogin);
adminRoutes.get('/adminDetails/:adminId',adminController.adminDetails);
adminRoutes.post('/adminChangePassword',adminController.adminChangePassword);

adminRoutes.get('/getAllUser',adminController.getAllUser);
adminRoutes.get('/getUserDetails/:userId',adminController.getUserDetails);
adminRoutes.post('/blockAndVerifyUser',adminController.blockAndVerifyUser);
// adminRoutes.get('/verifyUser/:userId',adminController.verifyUser);

adminRoutes.get('/totalRegisterUser',adminController.totalRegisterUser);
adminRoutes.get('/totalRegisterProfessional',adminController.totalRegisterProfessional);
adminRoutes.get('/totalRegisterBusiness',adminController.totalRegisterBusiness);

adminRoutes.get('/getAllProperty',adminController.getAllProperty);
adminRoutes.get('/getNormalProperty',adminController.getNormalProperty);
adminRoutes.get('/getProfessionalProperty',adminController.getProfessionalProperty);


adminRoutes.get('/getPropertyDetails/:id',adminController.getPropertyDetails);
adminRoutes.post('/editProperty',adminController.editProperty);

adminRoutes.post('/createSubadmin',adminController.createSubadmin);
adminRoutes.get('/subAdminList',adminController.subAdminList);
adminRoutes.get('/getSubadminDetails/:id',adminController.getSubadminDetails);
adminRoutes.post('/editSubadmin',adminController.editSubadmin);
adminRoutes.delete('/deleteSubadmin/:id',adminController.deleteSubadmin);


// adminRoutes.post('/createUser',multipartMiddleware);
// adminRoutes.post('/createUser',adminController.createUser);
// adminRoutes.post('/editUser/:userId',multipartMiddleware);
// adminRoutes.post('/editUser/:userId',adminController.editUser);


// adminRoutes.delete('/deleteUser/:userId',adminController.deleteUser);

adminRoutes.post('/addMarketingPopup',multipartMiddleware);
adminRoutes.post('/addMarketingPopup',adminController.addMarketingPopup);
adminRoutes.post('/editMarketingPopup',multipartMiddleware);
adminRoutes.post('/editMarketingPopup',adminController.editMarketingPopup);
adminRoutes.get('/getMarketingPopup',adminController.getMarketingPopup);
adminRoutes.get('/getPopupDetails/:marketingId',adminController.getPopupDetails);
adminRoutes.delete('/deletePopup/:marketingId',adminController.deletePopup);

adminRoutes.post('/addContent',adminController.addContent);
adminRoutes.get('/getContentDetails/:contentId',adminController.getContentDetails);
adminRoutes.post('/editContent',adminController.editContent);
adminRoutes.delete('/deleteContent/:contentId',adminController.deleteContent);

adminRoutes.post('/addCurrency',adminController.addCurrency);
adminRoutes.get('/currencyList',adminController.currencyList);
adminRoutes.get('/getCurrencyDetails/:currencyId',adminController.getCurrencyDetails);
adminRoutes.post('/editCurrency',adminController.editCurrency);
adminRoutes.delete('/deleteCurrency/:currencyId',adminController.deleteCurrency);

adminRoutes.post('/addLanguage',adminController.addLanguage);
adminRoutes.post('/updateLanguage',adminController.updateLanguage);
adminRoutes.post('/deleteLangauge',adminController.deleteLangauge);
adminRoutes.get('/getLanguage/:languageId',adminController.getLanguage);
adminRoutes.post('/getAllLanguage',adminController.getAllLanguage);


module.exports = adminRoutes;