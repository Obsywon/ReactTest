const express = require('express');
const router = express.Router();
const { handleLogin, handleRegister, handleLogout } = require('../controllers/AuthController');
const { refreshToken } = require('../middlewares/Webtoken');

router.post('/login', handleLogin);
router.post('/register', handleRegister);
router.get('/refreshToken', refreshToken)
router.get('/logout', handleLogout)



module.exports = router;