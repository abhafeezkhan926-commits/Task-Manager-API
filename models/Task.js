const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required.'],
      trim: true,
      maxlength: [150, 'Task title cannot exceed 150 characters.'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Task description cannot exceed 5000 characters.'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be pending, in-progress, or completed.',
      },
      default: 'pending',
    },
    dueDate: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Task', taskSchema);
