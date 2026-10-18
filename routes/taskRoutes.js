const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.route('/').post(asyncHandler(createTask)).get(asyncHandler(getTasks));
router.route('/:id')
  .get(asyncHandler(getTaskById))
  .put(asyncHandler(updateTask))
  .delete(asyncHandler(deleteTask));

module.exports = router;
