const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const authorize = authMiddleware([
    'System Administrator',
    'User Administrator'
]);

router.get('/', authorize, userController.getUsers);
router.post('/', authorize, userController.createUser);
router.get('/:id', authorize, userController.getUser);
router.put('/:id', authorize, userController.updateUser);
router.put('/:id/Lock', authorize, userController.lockUser);
router.put('/:id/Unlock', authorize, userController.unlockUser);
router.delete('/:id', authorize, userController.deleteUser);

module.exports = router;
