const mongoose = require('mongoose');
const dotenv = require('dotenv').config()
const cities = require('./cities');
const { places, descriptors } = require('./camplocations');
const Campground = require('../models/campground');

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

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '5fcb540605764c07dd544105',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price,
            images: [
                {
                    url: 'https://res.cloudinary.com/yelpcamp2-dhpppw3f0/image/upload/v1607237250/YelpCamp/t5a71zntqoxkygwula8k.jpg',
                    filename: 'YelpCamp/t5a71zntqoxkygwula8k'
                },
                {
                    url: 'https://res.cloudinary.com/yelpcamp2-dhpppw3f0/image/upload/v1607237253/YelpCamp/pw59dduf5varsl3gam0o.jpg',
                    filename: 'YelpCamp/pw59dduf5varsl3gam0o'
                },
                {
                    url: 'https://res.cloudinary.com/yelpcamp2-dhpppw3f0/image/upload/v1607237253/YelpCamp/ujpgam5k9bcrbfctsdyb.jpg',
                    filename: 'YelpCamp/ujpgam5k9bcrbfctsdyb'
                },
                {
                    url: 'https://res.cloudinary.com/yelpcamp2-dhpppw3f0/image/upload/v1607237255/YelpCamp/ujpgsy50atsemx4b5bei.jpg',
                    filename: 'YelpCamp/ujpgsy50atsemx4b5bei'
                }
            ]
        })
        await camp.save();
    }
}

seedDB().then(() => {
    console.log('Seeding Completed Successfully.');
    mongoose.connection.close();
})