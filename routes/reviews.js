const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');

// create a review 
router.post('/', isLoggedIn, validateReview, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Campground Review Created Successfully.');
    res.redirect(`/campgrounds/${ campground._id }`);
}));

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async (req, res,) => {
    const {id, reviewId} = req.params;
    // using pull operator to pull anything from a campground and remove by id
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }}); 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Campground Review Deleted Successfully.');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;