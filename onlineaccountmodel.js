const mongoose = require('mongoose');

// Define the schema for the account
const onlineaccountSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    aadharnumber: {
        type: Number,
        required: true
    },
    mobilenumber: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        default: 0 // Default value set to 0
    },
    address: {
        type: String,
        required: true
    },
    stat: {
        type: Boolean,
        default: false // Default value set to false
    }
});

// Create a model from the schema
const OnlineAccount = mongoose.model('OnlineAccount', onlineaccountSchema);

module.exports = OnlineAccount;
