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
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// express routes
const users = require('./routes/users');
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');


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

app.use(passport.initialize()); 
app.use(passport.session()); // passport middleware for persistant logins
passport.use(new LocalStrategy(User.authenticate())); // static method added onto schema

passport.serializeUser(User.serializeUser()); // storing user in session
passport.deserializeUser(User.deserializeUser()); // remove user after session

// flash access to templates with flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user; // provide the current user to all templates
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// generate a test user
app.get('/testUser', async (req, res) => {
    const newTestUser = new User({ email: 'TestUser@gmail.com', username: 'TestUserPerson'});
    const registerUser = await User.register(newTestUser, 'Test123');
    res.send(registerUser);
});


// use express routes
app.use('/', users)
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