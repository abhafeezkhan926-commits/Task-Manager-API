const mongoose = require('mongoose');
const Task = require('../models/Task');

const ALLOWED_FIELDS = new Set(['title', 'description', 'status', 'dueDate']);

function validatePayload(req, res, { requireTitle = false } = {}) {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ success: false, message: 'Request body must be a JSON object.' });
    return null;
  }

  const keys = Object.keys(req.body);
  const unknownKeys = keys.filter((key) => !ALLOWED_FIELDS.has(key));
  if (unknownKeys.length) {
    res.status(400).json({
      success: false,
      message: `Unknown field(s): ${unknownKeys.join(', ')}. Allowed fields are title, description, status, and dueDate.`,
    });
    return null;
  }

  if (requireTitle && (typeof req.body.title !== 'string' || !req.body.title.trim())) {
    res.status(400).json({ success: false, message: 'Task title is required and must be a non-empty string.' });
    return null;
  }

  if (!requireTitle && keys.length === 0) {
    res.status(400).json({ success: false, message: 'Provide at least one task field to update.' });
    return null;
  }

  for (const stringField of ['title', 'description', 'status']) {
    if (Object.prototype.hasOwnProperty.call(req.body, stringField) && typeof req.body[stringField] !== 'string') {
      res.status(400).json({ success: false, message: `${stringField} must be a string.` });
      return null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'title') && !req.body.title.trim()) {
    res.status(400).json({ success: false, message: 'Task title cannot be empty.' });
    return null;
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate') && req.body.dueDate !== null) {
    if (typeof req.body.dueDate !== 'string' || Number.isNaN(Date.parse(req.body.dueDate))) {
      res.status(400).json({ success: false, message: 'dueDate must be a valid date string or null.' });
      return null;
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'status') && !['pending', 'in-progress', 'completed'].includes(req.body.status)) {
    res.status(400).json({ success: false, message: 'Status must be pending, in-progress, or completed.' });
    return null;
  }

  return req.body;
}

function validateId(id, res) {
  if (!mongoose.isObjectIdOrHexString(id)) {
    res.status(400).json({ success: false, message: 'Invalid task ID format.' });
    return false;
  }
  return true;
}

async function createTask(req, res) {
  const payload = validatePayload(req, res, { requireTitle: true });
  if (!payload) return;

  const task = await Task.create(payload);
  res.status(201).json({ success: true, message: 'Task created successfully.', data: task });
}

async function getTasks(_req, res) {
  const tasks = await Task.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
}

async function getTaskById(req, res) {
  if (!validateId(req.params.id, res)) return;

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  res.status(200).json({ success: true, data: task });
}

async function updateTask(req, res) {
  if (!validateId(req.params.id, res)) return;
  const payload = validatePayload(req, res);
  if (!payload) return;

  // This endpoint accepts one or more fields, while still using PUT as requested by the assignment.
  const task = await Task.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
    context: 'query',
  });

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  res.status(200).json({ success: true, message: 'Task updated successfully.', data: task });
}

async function deleteTask(req, res) {
  if (!validateId(req.params.id, res)) return;

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  res.status(200).json({ success: true, message: 'Task deleted successfully.', data: task });
}

module.exports = { createTask, getTasks, getTaskById, updateTask, deleteTask };
