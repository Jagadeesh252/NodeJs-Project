
const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.post('/createUser', adminController.createUser);
router.put('/editUser/:userId', adminController.editUser);

module.exports = router;
