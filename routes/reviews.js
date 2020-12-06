const express = require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const catchAsync = require('../utilities/catchAsync') // async catch wrapper
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

// create a review 
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete a review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;