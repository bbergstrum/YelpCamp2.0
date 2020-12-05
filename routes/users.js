const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync ( async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, error => {
            if(error) return next(error);
            req.flash('success', 'Registration Successful. Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch(error) {
        req.flash('error', error.message);
        res.redirect('/campgrounds');
    }
}));

router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Login Successful. Welcome Back to Yelp Camp!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('Success', 'Logged Out Successfully');
    res.redirect('/campgrounds');
});

module.exports = router;