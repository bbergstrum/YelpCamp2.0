const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// campgrounds index
router.get('/', catchAsync(campgrounds.index));

// new campgrounds
router.get('/new', isLoggedIn, campgrounds.newCampground);

// post campgrounds
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); 

// show campground
router.get('/:id', catchAsync(campgrounds.showCampground));

// edit campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));

// update campground
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;