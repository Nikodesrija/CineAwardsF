const express = require('express');
const router = express.Router();
const User = require('../models/user'); 
const Category = require('../models/category');
const { jwtAuthMiddleware } = require('../jwt');

const checkAdminRole = async (userId) => {
 if (!userId) return false;
 try {
   const user = await User.findById(userId);
    return user?.role === 'admin';
 } catch (err) {
   return false;
 }
};
router.get('/parents', async (req, res) => {
  try {
    const parents = await Category.find({ parentCategory: null }).sort({ name: 1 });
    res.status(200).json({ data: parents });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add new category
router.post('/add', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!await checkAdminRole(req.user.id)) {
      return res.status(403).json({ error: 'user has no admin role' });
    }

    const { name, description, votingStart, votingEnd, parentCategory, group } = req.body;
    const category = new Category({
      name,
      description,
      votingStart,
      votingEnd,
      parentCategory: parentCategory || null, // may be null if top-level
      group
    });

    const response = await category.save();
    res.status(200).json({ response });
  } catch (err) {
     res.status(500).json({ error: 'Internal server error' });
  }
});


// Update category
router.put('/category/:id', jwtAuthMiddleware, async (req, res) => {
  if (!await checkAdminRole(req.user.id)) {
    return res.status(403).json({ error: 'user has no admin role' });
  }
  try {
    const categoryId = req.params.id;
    const updateData = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category updated', data: updatedCategory });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().populate('parentCategory').sort({ name: 1 });
    res.status(200).json({ data: categories });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get voting dates for a category
router.get('/dates/:categoryName', async (req, res) => {
  try {
    const category = await Category.findOne({ name: req.params.categoryName });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({
      startDate: category.votingStart,
      endDate: category.votingEnd
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/grouped', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    const grouped = categories.reduce((acc, category) => {
      const group = category.group || 'Ungrouped';
      if (!acc[group]) acc[group] = [];
      acc[group].push({ _id: category._id,name: category.name, description: category.description });
      return acc;
    }, {});

    res.json(grouped);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
