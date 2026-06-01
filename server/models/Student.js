const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  fullName: { type: String, default: '' },
  mobile: { type: String, default: '' },
  classCompleted: {
    type: String,
    enum: ['10th', 'Intermediate', 'Diploma', ''],
    default: ''
  },
  profileCompleted: { type: Boolean, default: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
