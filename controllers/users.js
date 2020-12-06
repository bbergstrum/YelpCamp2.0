const User = require('../models/user');

module.exports.registrationForm = (req, res) => {
    res.render('users/register');
}

module.exports.registerUser = async (req, res, next) => {
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
}

module.exports.loginForm = (req, res) => {
    res.render('users/login');
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Login Successful. Welcome Back to Yelp Camp!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('Success', 'Logged Out Successfully');
    res.redirect('/campgrounds');
}