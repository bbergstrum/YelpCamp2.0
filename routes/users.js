const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', catchAsync ( async (req, res) => {
    try {
        const {email, username, password} = req.body;
        const newUser = new User({ email, username });
        const registerUser = await User.register(newUser, password);
        req.flash('success', 'Registration Successful. Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
    } catch(error) {
        req.flash('error', error.message);
        res.redirect('/campgrounds');
    }
}));

module.exports = router;