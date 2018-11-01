const express = require('express');
const seedController = require('../controllers/seedController');
const router = express.Router();

router.get('/', seedController.seedData);

module.exports = router;
