const express = require('express');
const accountController = require('../controllers/accountController');
const router = express.Router();

router.post('/Register', accountController.register);
router.post('/RegisterExternal', accountController.registerExternal);
router.put('/ForgotPassword', accountController.forgotPassword);
router.put('/ResetPassword', accountController.resetPassword);

module.exports = router;
