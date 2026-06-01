const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

// @route   POST /api/student/register
// @desc    Create student record on first auth, or return existing
// @access  Public
router.post('/register', async (req, res) => {
  const { uid, email } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ msg: 'uid and email are required' });
  }

  try {
    let student = await Student.findOne({ uid });
    if (!student) {
      student = new Student({ uid, email });
      await student.save();
    }
    res.json(student);
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/student/profile
// @desc    Complete onboarding — set fullName, mobile, classCompleted
// @access  Public (caller must own the uid via Firebase client-side auth)
router.post('/profile', async (req, res) => {
  const { uid, fullName, mobile, classCompleted } = req.body;

  if (!uid) return res.status(400).json({ msg: 'uid is required' });
  if (!fullName || !fullName.trim()) return res.status(400).json({ msg: 'Full name is required' });
  if (!/^\d{10}$/.test(mobile)) return res.status(400).json({ msg: 'Mobile must be exactly 10 digits' });
  if (!['10th', 'Intermediate', 'Diploma'].includes(classCompleted)) {
    return res.status(400).json({ msg: 'Invalid class selection' });
  }

  try {
    const student = await Student.findOneAndUpdate(
      { uid },
      { fullName: fullName.trim(), mobile, classCompleted, profileCompleted: true },
      { new: true }
    );
    if (!student) return res.status(404).json({ msg: 'Student record not found' });
    res.json(student);
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
