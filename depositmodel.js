// models/deposit.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const depositSchema = new Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  time: { type: Date, default: Date.now },
  transactionId: { type: String, required: true },
});

const Deposit = mongoose.model('Deposit', depositSchema);

module.exports = Deposit;
