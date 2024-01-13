
const express = require('express');
const groupController = require('../controllers/groupController');

const router = express.Router();

router.post('/createGroup', groupController.createGroup);
router.delete('/deleteGroup/:groupId', groupController.deleteGroup);
router.get('/searchGroups', groupController.searchGroups);
router.post('/addMemberToGroup/:groupId', groupController.addMemberToGroup);

module.exports = router;
