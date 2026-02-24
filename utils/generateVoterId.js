const User = require('../models/user'); // Ensure this is correct in utils if needed

async function generateVoterId() {
  let voterId;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    voterId = 'VOTER' + randomNum;
    exists = await User.exists({ voterId }); // ensure no duplicate
  }

  return voterId;
}

module.exports = generateVoterId;
