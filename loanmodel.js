const mongoose = require('mongoose');

const loanRequestSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    loanAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending' // Default status is Pending
    }
});

const LoanRequest = mongoose.model('LoanRequest', loanRequestSchema);

module.exports = LoanRequest;
