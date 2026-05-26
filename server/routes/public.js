const express = require('express');
const router = express.Router();
const College = require('../models/College');
const Branch = require('../models/Branch');
const PDFDocument = require('../models/PDFDocument');

// @route   GET /api/colleges/:exam
// @desc    Get all colleges for a specific exam
// @access  Public
router.get('/colleges/:exam', async (req, res) => {
  try {
    const { exam } = req.params;
    if (!['TS ECET', 'TS EAPCET', 'TS POLYCET'].includes(exam)) {
      return res.status(400).json({ msg: 'Invalid exam selector' });
    }

    const colleges = await College.find({ exam }).sort({ name: 1 });
    
    // Add branch count for each college to elevate UI details
    const collegeList = await Promise.all(colleges.map(async (college) => {
      const branchCount = await Branch.countDocuments({ collegeId: college._id });
      return {
        ...college.toObject(),
        branchCount
      };
    }));

    res.json(collegeList);
  } catch (err) {
    console.error('Error fetching colleges:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/branches/:collegeId
// @desc    Get all branches for a college
// @access  Public
router.get('/branches/:collegeId', async (req, res) => {
  try {
    const { collegeId } = req.params;
    const branches = await Branch.find({ collegeId }).sort({ name: 1 });

    // Enhance each branch with PDF availability flags
    const branchList = await Promise.all(branches.map(async (branch) => {
      const pdf = await PDFDocument.findOne({ branchId: branch._id }).select('_id filename');
      return {
        ...branch.toObject(),
        hasPDF: !!pdf,
        pdfId: pdf ? pdf._id : null,
        pdfFilename: pdf ? pdf.filename : null
      };
    }));

    res.json(branchList);
  } catch (err) {
    console.error('Error fetching branches:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/pdf/:branchId
// @desc    Stream PDF document for a specific branch
// @access  Public
router.get('/pdf/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const pdf = await PDFDocument.findOne({ branchId });

    if (!pdf) {
      return res.status(404).json({ msg: 'Allotment PDF not found for this branch' });
    }

    // Set standard PDF streaming headers
    res.set('Content-Type', pdf.contentType || 'application/pdf');
    res.set('Content-Disposition', `inline; filename="${pdf.filename}"`);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day

    res.send(pdf.data);
  } catch (err) {
    console.error('Error streaming PDF:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
