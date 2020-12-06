const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

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
    // find the campground by id and populate all the reviews for that campground
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        // then populate the authors for each review
        populate: { 
            path: 'author'
        }
    }).populate('author'); // then populate the author for the campground itself
    if(!campground){
        req.flash('error', 'Campground Not Found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));

// edit campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync( async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // check the campground exists
    if(!campground){
        req.flash('error', 'Campground Not Found.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}));

// update campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync( async (req, res) => {
    const { id } = req.params;
    // spread the campground object to the campground schema
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); 
    req.flash('success', 'Successfully Updated Campground.');
    res.redirect(`/campgrounds/${campground._id}`);
}));

// delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync( async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground Deleted Successfully.');
    res.redirect('/campgrounds');
}));

module.exports = router;