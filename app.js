const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config()
const morgan = require('morgan') // http request logger
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // an ejs engine
const { campgroundSchema, reviewSchema } = require('./schemaValidations');
const catchAsync = require('./utilities/catchAsync') // async catch wrapper
const ExpressError = require('./utilities/ExpressError'); // express error class
const methodOverride = require('method-override'); // override HTTP verbs
const cities = require('./seeds/cities');
const {places, descriptors} = require('./seeds/camplocations');
const Campground = require('./models/campground');
const Review = require('./models/review');

// express routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

// connect to mongodb with connection string
const mongo_connection_string = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.jinak.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(mongo_connection_string, {
    // with required params
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

// shorten mongoose.connection
const db = mongoose.connection;
// check for errors
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

// generate a random array index for a sample campground location
const sampleLocation = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    // delete existing db entries
    await Campground.deleteMany({});
    // generate dummy data
    for(let i = 0; i < 50; i++)
    {
        // generate random number for cities index
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const campground = new Campground({
            // generate a random city destination
            location: `${cities[random].city}, ${cities[random].state}`,
            // generate a random sample campground from camplocations.js
            title: `${sampleLocation(descriptors)} ${sampleLocation(places)}`,
            // generate a random image from the woods unsplash collection
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Nihil distinctio assumenda praesentium nostrum cum quia nam non voluptatem quae! Placeat, perspiciatis animi incidunt nulla natus perferendis illum omnis sit adipisci.',
            price
        });
        await campground.save();
    }
};

// seed db returns a promise because its an async function
// seedDB().then(() => {
//     // close the connection to the db for this function
//     mongoose.connection.close();
// });

const app = express();

app.use(morgan('tiny'));
app.engine('ejs', ejsMate); // use ejsmate instead of default ejs engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // joining absolute paths

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));

// using routes
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// basic error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message } = err;
    if(!err.message) err.message = 'Something Went Wrong...';
    res.status(statusCode).render('./partials/error', { err });
});

// serve on port 3000
app.listen(3000, () => {
    console.log('Serving on port 3000');
});