const mongoose = require('mongoose');

const CollegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  exam: {
    type: String,
    required: true,
    enum: ['TS ECET', 'TS EAPCET', 'TS POLYCET'],
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', CollegeSchema);
