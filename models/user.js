const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema ({
    email : {
        type: String,
        required: true,
        unique: true
    }
});

// pass in the passport mongoose package to the user schema -
// adds components for user/pw, adds additional methods to the schema
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);