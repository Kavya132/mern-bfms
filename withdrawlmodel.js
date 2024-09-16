// models/withdrawl.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const withdrawlSchema = new Schema({
  email: { type: String, required: true },
  amount: { type: Number, required: true },
  time: { type: Date, default: Date.now },
  transactionId: { type: String, required: true },
});

const Withdrawl = mongoose.model('Withdrawl', withdrawlSchema);

module.exports = Withdrawl;
