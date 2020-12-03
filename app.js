const express = require('express');
const path = require('path');
const dotenv = require('dotenv').config()
const morgan = require('morgan') // http request logger
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate'); // an ejs engine
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError'); // express error class
const methodOverride = require('method-override'); // override HTTP verbs

const Campground = require('./models/campground');

// express routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');
const { date } = require('joi');

// connect to mongodb with connection string
const mongo_connection_string = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.jinak.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`
mongoose.connect(mongo_connection_string, {
    // with required params
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// shorten mongoose.connection
const db = mongoose.connection;
// check for errors
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

const app = express();

app.use(morgan('tiny'));
app.engine('ejs', ejsMate); // use ejsmate instead of default ejs engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // joining absolute paths

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// express session cookie
const sessionConfig = {
    secret: 'secret123',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // one week in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
app.use(flash());

// flash access to templates with flash middleware
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

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