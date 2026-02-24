const express = require('express');
const router = express.Router();
const Nominee = require('../models/Nominee');
const  Category= require('../models/category');

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    const results = [];

    for (const category of categories) {
      const nominees = await Nominee.find({ category: category._id }).select('name voteCount');

      results.push({
        categoryName: category.name,
        nominees: nominees.map(n => ({
          name: n.name,
          voteCount: n.voteCount || 0
        }))
      });
    }
   console.log(JSON.stringify(results, null, 2));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
