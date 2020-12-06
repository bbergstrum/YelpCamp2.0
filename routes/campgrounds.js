const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

router.route('/')
    // get all campgrounds
    .get(catchAsync(campgrounds.index)) 
    // create a new campground
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// new campgrounds form
router.get('/new', isLoggedIn, campgrounds.newCampground);

router.route('/:id')
    // show campground
    .get(catchAsync(campgrounds.showCampground)) 
    // update campground
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground)) 
    // delete campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)); 


// edit campgrounds form
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));

module.exports = router;