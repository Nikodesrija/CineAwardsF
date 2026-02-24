const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Nominee = require('../models/Nominee');
const Category = require('../models/category');
const Notification = require('../models/Notification');
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const mongoose = require('mongoose');

const checkAdminRole = async (userId) => {
  if (!userId) return false;
  try {
    const user = await User.findById(userId);
    return user?.role === 'admin';
  } catch (err) {
    return false;
  }
};

// PUT: Update nominee
router.put('/:nomineeID', jwtAuthMiddleware, async (req, res) => {
  if (!await checkAdminRole(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized: Admins only' });
  }

  try {
    const updatedNominee = await Nominee.findByIdAndUpdate(
      req.params.nomineeID,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedNominee) return res.status(404).json({ message: 'Nominee not found' });

    res.status(200).json({ message: 'Nominee updated successfully', data: updatedNominee });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Add a nominee
router.post('/add', jwtAuthMiddleware, async (req, res) => {
  if (!await checkAdminRole(req.user.id)) {
    return res.status(403).json({ error: 'User has no admin role' });
  }

  try {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ error: 'Invalid category ID' });

    const nominee = new Nominee(req.body);
    const savedNominee = await nominee.save();
    res.status(200).json({ response: savedNominee });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: All nominees with category details and vote count
router.get('/vote/count', jwtAuthMiddleware, async (req, res) => {
  try {
    const nominees = await Nominee.find().populate('category').sort({ voteCount: -1 });

    const result = nominees.map(nominee => ({
      nomineeName: nominee.name,
      description: nominee.description,
      category: nominee.category?.name || 'Unknown',
      voteCount: nominee.voteCount
    }));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE: Nominee
router.delete('/:nomineeID', jwtAuthMiddleware, async (req, res) => {
  if (!await checkAdminRole(req.user.id)) {
    return res.status(403).json({ error: 'Unauthorized: Admins only' });
  }

  try {
    const response = await Nominee.findByIdAndDelete(req.params.nomineeID);
    if (!response) return res.status(404).json({ error: 'Nominee not found' });

    res.status(200).json({ message: 'Nominee deleted successfully', data: response });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Vote for a nominee
router.post('/vote/:nomineeID', jwtAuthMiddleware, async (req, res) => {
  if (await checkAdminRole(req.user.id)) {
    return res.status(403).json({ message: 'Admins are not allowed to vote' });
  }

  try {
    const nominee = await Nominee.findById(req.params.nomineeID).populate('category');
    if (!nominee) return res.status(404).json({ message: 'Nominee not found' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const votingEndOfDay = new Date(nominee.category.votingEnd);
    votingEndOfDay.setHours(23, 59, 59, 999);

    if (now < nominee.category.votingStart || now > votingEndOfDay) {
      return res.status(400).json({ message: 'Voting is not active for this category' });
    }

    const nomineesInCategory = await Nominee.find({ category: nominee.category._id });
    const alreadyVoted = nomineesInCategory.some(n =>
      n.votes.some(v => v.user.toString() === req.user.id)
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this category' });
    }

    nominee.votes.push({ user: req.user.id });
    nominee.voteCount++;
    await nominee.save();

    const newNotification = new Notification({
      message: `User ${user.name} voted for ${nominee.name} in category ${nominee.category.name}`
    });
    await newNotification.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Nominees per category
router.get('/nominees/category/:categoryId', jwtAuthMiddleware, async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    console.log("Fetching nominees for categoryId:", categoryId);
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ error: 'Invalid category ID' });
    }
    const nominees = await Nominee.find({ category: categoryId }).populate('category', 'name group');
    const category = await Category.findById(categoryId);
    res.status(200).json({ nominees, category });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: List all nominees
router.get('/nominees', jwtAuthMiddleware, async (req, res) => {
  try {
    const nominees = await Nominee.find().populate('category', 'name group');
    res.status(200).json({ data: nominees });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;