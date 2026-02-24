const express=require('express');
const router=express.Router();
const User=require('./../models/user');
const Nominee = require('../models/Nominee');
const verifyAadhar = require('../utils/verifyAadhar');
const generateVoterId = require('../utils/generateVoterId');
const {jwtAuthMiddleware,generateToken}=require('./../jwt');
const bcrypt = require('bcrypt');



router.get('/verify-token', jwtAuthMiddleware, (req, res) => {
    const { role } = req.user;
    res.json({ role });
});

//signup route
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;
    const requiredFields = ['name', 'age', 'mobile', 'address', 'aadharCardNumber', 'password'];
    for (let field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    if (!verifyAadhar(data.aadharCardNumber)) {
      return res.status(400).json({ error: 'Invalid Aadhar Number' });
    }
    const existingUser = await User.findOne({ aadharCardNumber: data.aadharCardNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'Aadhar number already registered' });
    }
    if (data.role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(403).json({ error: 'Admin already exists' });
      }
      data.username = 'admin';
    } else {
      data.voterId = await generateVoterId();
      data.username = data.voterId;
    }
    const newUser = new User(data);
    const response = await newUser.save();
    const payload = { id: response._id, role: response.role };
    const token = generateToken(payload);

    res.status(200).json({ response: { voterId: response.voterId }, token });

  } catch (err) {
        res.status(500).json({ error: 'Internal server error during signup' });
  }
});


//login route
router.post('/login', async (req, res) => {
  try {
    const { username, password, voterId } = req.body;

    let user;
    if (username === 'admin') {
      user = await User.findOne({ username: 'admin' });
    } else {
      user = await User.findOne({ voterId });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });

    // schema method to compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken({ id: user._id, role: user.role });
    res.json({ token });

  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const nomineesVoted = await Nominee.find({ 'votes.user': userId });

    const votesCount = nomineesVoted.length;

    const categoriesVoted = new Set(nomineesVoted.map(n => n.category.toString())).size;

    res.status(200).json({
      username: user.username,
      name: user.name,
      age: user.age,
      mobile: user.mobile,
      address: user.address,
      createdAt: user.createdAt,
      votesCount,
      categoriesVoted
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        const { id } = req.user;    
        const {currentPassword,newPassword}=req.body  //extract currentand new passwords from request body
        //find the user by id
        const user = await User.findById(id);
        //compare current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'invalid password' });
        }

        user.password=newPassword;
        await user.save();                                                                                                                                                                                                                                                                                                                                                                          
        console.log('password updated');
        res.status(200).json({message:'password updated'});
    }
    catch(err){
        res.status(500).json({error:'internal server error'});

    }
})
// PUT /user/edit-profile
router.put('/edit-profile', jwtAuthMiddleware, async (req, res) => {
  const userId = req.user.id;
  const { name, age, address, mobile, password } = req.body;

  const updateData = { name, age, address, mobile };
  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  try {
   const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
  new: true,
  runValidators: true,
});

res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});
router.post('/verify-for-reset', async (req, res) => {
  const { voterId, mobile } = req.body;

  try {
    const user = await User.findOne({ username: voterId, mobile });

    if (!user) {
      return res.status(404).json({ message: "User not found with provided Voter ID and Mobile number" });
    }

    res.status(200).json({ message: "User verified. Proceed to reset password." });
  } catch (err) {
    res.status(500).json({ message: "Server error while verifying" });
  }
});

router.post('/reset-password', async (req, res) => {
  const { voterId, newPassword } = req.body;

  if (!voterId || !newPassword) {
    return res.status(400).json({ message: "Voter ID and new password are required" });
  }

  try {
    const user = await User.findOne({ username: voterId });

    if (!user) {
      return res.status(404).json({ message: "User not found for password reset" });
    }
user.password = newPassword;
await user.save();
res.status(200).json({ message: "Password reset successful" });

  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
});
module.exports=router;
