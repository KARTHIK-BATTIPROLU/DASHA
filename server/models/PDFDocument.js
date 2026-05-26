const mongoose = require('mongoose');

const PDFDocumentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
    unique: true, // 1-to-1 relationship: one PDF per branch
  },
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    default: 'application/pdf',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PDFDocument', PDFDocumentSchema);
