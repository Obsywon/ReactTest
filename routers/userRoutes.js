const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUserByid, deleteUserById } = require('../controllers/UserController');

router.route('/')
    .get(getAllUsers);

router.route('/:id')
    .get(getUserById)
    .put(updateUserByid)
    .delete(deleteUserById);

module.exports = router;