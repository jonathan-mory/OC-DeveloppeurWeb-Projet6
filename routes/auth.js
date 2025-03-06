const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/auth');
const { validateSignup } = require('../middlewares/validators');

router.post('/signup', validateSignup, authCtrl.signup);
router.post('/login', authCtrl.login);

module.exports = router;
