// utils/verifyAadhar.js
function verifyAadhar(aadharNumber) {
  // Aadhaar must be 12 digits and not start with 0 or 1
  return /^[2-9]{1}[0-9]{11}$/.test(aadharNumber);
}

module.exports = verifyAadhar;
