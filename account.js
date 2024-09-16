const mongoose = require('mongoose');

// Define the schema for the account
const accountSchema = new mongoose.Schema({
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
    initialBalance: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    }
});

// Create a model from the schema
const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
