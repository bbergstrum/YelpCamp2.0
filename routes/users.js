const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');

router.get('/register', users.registrationForm)

router.post('/register', catchAsync (users.registerUser));

router.get('/login', users.loginForm);

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser);

router.get('/logout', users.logoutUser);

module.exports = router;