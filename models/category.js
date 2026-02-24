// models/category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  votingStart: { type: Date, required: true },
  votingEnd: { type: Date, required: true },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  group: {
    type: String,
    enum: ['Acting', 'Directing', 'Technical', 'Writing'], 
    required: true
  }
});

module.exports = mongoose.model('Category', categorySchema);
