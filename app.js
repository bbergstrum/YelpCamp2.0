const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config()
const morgan = require('morgan') // http request logger
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // an ejs engine
const methodOverride = require('method-override'); // override HTTP verbs
const cities = require('./seeds/cities');
const {places, descriptors} = require('./seeds/camplocations');
const Campground = require('./models/campground');

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
        const campground = new Campground({
            // generate a random city destination
            location: `${cities[random].city}, ${cities[random].state}`,
            // generate a random sample campground from camplocations.js
            title: `${sampleLocation(descriptors)} ${sampleLocation(places)}`
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

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
    const newCampground = new Campground(req.body.campground);
    await newCampground.save();
    res.redirect(`/campgrounds/${newCampground._id}`);
});

app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    // spread the campground object to the campground schema
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}); 
    res.redirect(`/campgrounds/${campground._id}`);
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.listen(3000, () => {
    console.log('Serving on port 3000');
});