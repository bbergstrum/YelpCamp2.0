const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CampgroundSchema.post('findOneAndDelete', async function (doc){
    if (doc) {
        await Review.deleteMany({
            // the id for each review is found somewhere IN doc.reviews
            _id: {
                $in: doc.reviews // delete all reviews where their id is in the deleted document reviews array
            }
        })
    }
});
module.exports = mongoose.model('Campground', CampgroundSchema);