const express = require('express');
const { planTask } = require('../controllers/aiController');

const router = express.Router();
router.post('/plan-task', planTask);

module.exports = router;
