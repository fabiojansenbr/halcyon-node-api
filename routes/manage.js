const express = require('express');
const manageController = require('../controllers/manageController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const authorize = authMiddleware();

router.get('/', authorize, manageController.getProfile);
router.put('/', authorize, manageController.updateProfile);
router.put('/VerifyEmail', authorize, manageController.verifyEmail);
router.put('/ConfirmEmail', authorize, manageController.confirmEmail);
router.put('/ChangePassword', authorize, manageController.changePassword);
router.put('/SetPassword', authorize, manageController.setPassword);
router.post('/Login', authorize, manageController.addLogin);
router.delete('/Login', authorize, manageController.removeLogin);
router.get('/TwoFactor', authorize, manageController.getTwoFactorConfig);
router.post('/TwoFactor', authorize, manageController.enableTwoFactor);
router.delete('/TwoFactor', authorize, manageController.disableTwoFactor);
router.delete('/', authorize, manageController.deleteAccount);

module.exports = router;
