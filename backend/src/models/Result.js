const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    text: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Easy', 'Moderate', 'Challenging'],
      required: true,
    },
    marks: { type: Number, required: true },
    options: { type: [String], default: [] },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [questionSchema], required: true },
  },
  { _id: false }
);

const answerKeySchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    answer: { type: String, required: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    schoolName: { type: String },
    subject: { type: String },
    className: { type: String },
    timeAllowed: { type: String },
    maximumMarks: { type: Number },
    generalInstruction: { type: String },
    sections: { type: [sectionSchema], required: true },
    answerKey: { type: [answerKeySchema], required: true },
    generatedAt: { type: Date, default: Date.now },
    pdfUrl: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Result', resultSchema);
