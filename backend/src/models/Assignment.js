const mongoose = require('mongoose');

const questionTypeSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    numQuestions: { type: Number, required: true },
    marksPerQuestion: { type: Number, required: true },
  },
  { _id: false }
);

const assignmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    schoolName: { type: String, required: true },
    subject: { type: String, required: true },
    className: { type: String, required: true },
    fileUrl: { type: String, default: null },
    fileType: {
      type: String,
      enum: ['pdf', 'image', null],
      default: null,
    },
    dueDate: { type: Date, required: true },
    questionTypes: { type: [questionTypeSchema], required: true },
    totalQuestions: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    additionalInstructions: { type: String, default: '' },
    assignedOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
