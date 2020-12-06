const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');

router.route('/register')
    // user register form
    .get(users.registrationForm)
    // create new user
    .post(catchAsync (users.registerUser));

router.route('/login')
    // user login form
    .get(users.loginForm)
    // login user
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser);

// logout user
router.get('/logout', users.logoutUser);

module.exports = router;