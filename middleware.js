const { campgroundSchema, reviewSchema } = require('./schemaValidations'); // Joi schema
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utilities/ExpressError'); // express error class

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in to do that!');
        return res.redirect('/login');
    }
    next();
}

// campground validation middleware
module.exports.validateCampground = (req, res, next) => {
    // throw an error if the campground object and its keys failed validation
    const { error } = campgroundSchema.validate(req.body);
    if(error){
        const errorMessage = error.details.map( element => element.message).join(',');
        throw new ExpressError(errorMessage, 400);
    } else {
        next();
    }
};

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    // check if the current user owns the campground
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`)
    } 
    next();
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    // check if the current user owns the campground
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    } 
    next();
}

// review validation middleware
module.exports.validateReview = (req, res, next) => {
    // throw an error if the review object and its keys failed validation
   const { error } = reviewSchema.validate(req.body);
   if(error){
       const errorMessage = error.details.map( element => element.message).join(',');
       throw new ExpressError(errorMessage, 400);
   } else {
       next();
   }
};