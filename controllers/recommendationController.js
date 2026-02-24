const Nominee = require("../models/Nominee");

exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    const nominees = await Nominee.find({
      "votes.user": userId
    }).populate({
      path: "category",
      select: "group"
    });

    if (!nominees.length) {
      return res.json({});
    }

    const groupCount = {};

    nominees.forEach(n => {
      const group = n.category.group;
      groupCount[group] = (groupCount[group] || 0) + 1;
    });

    const recommendedGroup = Object.keys(groupCount).reduce((a, b) =>
      groupCount[a] > groupCount[b] ? a : b
    );

    res.json({ recommendedGroup });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};