const express = require('express');
const controller = require('../controllers/authController');

const router = express.Router();
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/users', controller.listUsers);

module.exports = router;
