const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const ExpressError = require('../utilities/ExpressError'); // express error class
const Campground = require('../models/campground');
const { campgroundSchema} = require('../schemaValidations'); // Joi schema
const { isLoggedIn } = require('../middleware');
const campground = require('../models/campground');

// campground validation middleware
const validateCampground = (req, res, next) => {
    // throw an error if the campground object and its keys failed validation
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const errorMessage = error.details.map( element => element.message).join(',');
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
};

// campgrounds 
router.get('/', catchAsync( async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// new campgrounds
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

// post campgrounds
router.post('/', isLoggedIn, validateCampground, catchAsync( async (req, res, next) => {
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash('success', 'Campground Created Successfully.');
    res.redirect(`/campgrounds/${newCampground._id}`);
}));

// show campground
router.get('/:id', catchAsync( async (req, res) => {
    // find campground by id and populate it with its corresponding reviews
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if(!campground){
        req.flash('error', 'Campground Not Found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// edit campground
router.get('/:id/edit', isLoggedIn, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if(!campground){
        req.flash('error', 'Campground Not Found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// update campground
router.put('/:id', isLoggedIn, validateCampground, catchAsync( async (req, res) => {
    const { id } = req.params;
    // spread the campground object to the campground schema
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); 
    req.flash('success', 'Successfully Updated Campground.');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete campground
router.delete('/:id', isLoggedIn, catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted Successfully.');
    res.redirect('/campgrounds');
}));

module.exports = router;