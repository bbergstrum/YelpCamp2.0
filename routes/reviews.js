const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const ExpressError = require('../utilities/ExpressError'); // express error class
const Campground = require('../models/campground');
const Review = require('../models/review');
const { reviewSchema } = require('../schemaValidations'); // Joi schema

// review validation middleware
const validateReview = (req, res, next) => {
    // throw an error if the review object and its keys failed validation
   const { error } = reviewSchema.validate(req.body);
   if(error){
       const errorMessage = error.details.map( element => element.message).join(',');
       throw new ExpressError(errorMessage, 400);
   } else {
       next();
   }
};

// create a review 
router.post('/', validateReview, catchAsync( async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Campground Review Created Successfully.');
    res.redirect(`/campgrounds/${ campground._id }`);
}));

// delete a review
router.delete('/:reviewId', catchAsync( async (req, res,) => {
    const {id, reviewId} = req.params;
    // using pull operator to pull anything from a campground and remove by id
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId }}); 
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Campground Review Deleted Successfully.');
    res.redirect(`/campgrounds/${id}`);
}));

module.exports = router;