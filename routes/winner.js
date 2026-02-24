// routes/winner.js
const express = require('express');
const router = express.Router();
const Nominee = require('../models/Nominee');
const Category = require('../models/category');

router.get('/result', async (req, res) => {
  try {
    const categories = await Category.find();
    const results = [];

    for (const category of categories) {
      const winner = await Nominee.findOne({ category: category._id })
        .sort({ voteCount: -1 })
        .select('name voteCount category film role workTitle image');

      results.push({
        categoryName: category.name,
        group: category.group || 'Ungrouped',
        winner: winner || null
      });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
