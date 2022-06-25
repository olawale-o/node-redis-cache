const express = require('express');
const router = express.Router();
const controller = require('../../controllers/users_controller');

router.get('/', controller.getUsers);

module.exports = router;
