const mongoose = require('mongoose');

const nomineeSchema = new mongoose.Schema({
  name: { type: String, required: true },

  description: {
    type: String,
    default: ''
  },

  image: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },

  // NEW OPTIONAL FIELDS
  film: {
    type: String,
    default: null
  },

  workTitle: {
    type: String,
    default: null
  },

  role: {
    type: String,
    default: null
  },

  voteCount: {
    type: Number,
    default: 0
  },

  votes: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ]
});

module.exports = mongoose.model('Nominee', nomineeSchema);
