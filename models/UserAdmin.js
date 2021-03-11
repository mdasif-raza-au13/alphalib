const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    isActive: Boolean
},{collection: 'useradmin'});

module.exports = mongoose.model('UserAdmin',UserSchema);