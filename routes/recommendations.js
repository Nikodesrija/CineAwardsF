const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controllers/recommendationController");
const { jwtAuthMiddleware, generateToken } = require('../jwt');
router.get("/recommendations", jwtAuthMiddleware, getRecommendations);

module.exports = router;