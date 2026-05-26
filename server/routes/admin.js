const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const auth = require('../middleware/auth');
const College = require('../models/College');
const Branch = require('../models/Branch');
const PDFDocument = require('../models/PDFDocument');

// Multer setup - store files in memory as Buffers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit files to 5MB (safeguard)
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// @route   POST /api/admin/login
// @desc    Admin login and token generation
// @access  Public
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const envUsername = process.env.ADMIN_USERNAME || 'admin';
    const envPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username !== envUsername || password !== envPassword) {
      return res.status(400).json({ msg: 'Invalid administrative credentials' });
    }

    const payload = {
      admin: {
        username: envUsername
      }
    };

    // Sign a 24-hour token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, username });
      }
    );
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/admin/structure
// @desc    Retrieve full database hierarchy tree (Exams -> Colleges -> Branches -> PDFs)
// @access  Private (Admin Auth Required)
router.get('/structure', auth, async (req, res) => {
  try {
    const exams = ['TS ECET', 'TS EAPCET', 'TS POLYCET'];
    const tree = [];

    for (const exam of exams) {
      const colleges = await College.find({ exam }).sort({ name: 1 });
      const collegeNodes = [];

      for (const college of colleges) {
        const branches = await Branch.find({ collegeId: college._id }).sort({ name: 1 });
        const branchNodes = [];

        for (const branch of branches) {
          const pdf = await PDFDocument.findOne({ branchId: branch._id }).select('_id filename');
          branchNodes.push({
            id: branch._id,
            name: branch.name,
            type: 'branch',
            pdf: pdf ? { id: pdf._id, filename: pdf.filename } : null
          });
        }

        collegeNodes.push({
          id: college._id,
          name: college.name,
          type: 'college',
          branches: branchNodes
        });
      }

      tree.push({
        id: exam,
        name: exam,
        type: 'exam',
        colleges: collegeNodes
      });
    }

    res.json(tree);
  } catch (err) {
    console.error('Error constructing structure tree:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/admin/college
// @desc    Create a new college under an exam
// @access  Private
router.post('/college', auth, async (req, res) => {
  const { name, exam } = req.body;

  if (!name || !exam) {
    return res.status(400).json({ msg: 'Please provide college name and exam type' });
  }

  if (!['TS ECET', 'TS EAPCET', 'TS POLYCET'].includes(exam)) {
    return res.status(400).json({ msg: 'Invalid exam type' });
  }

  try {
    const newCollege = new College({ name, exam });
    const college = await newCollege.save();
    res.json(college);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/college/:id
// @desc    Update an existing college name
// @access  Private
router.put('/college/:id', auth, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'College name is required' });
  }

  try {
    let college = await College.findById(req.params.id);
    if (!college) return res.status(404).json({ msg: 'College not found' });

    college.name = name;
    await college.save();
    res.json(college);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/college/:id
// @desc    Delete a college and cascade delete all associated branches and PDFs
// @access  Private
router.delete('/college/:id', auth, async (req, res) => {
  try {
    const collegeId = req.params.id;
    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ msg: 'College not found' });

    // Find all branches under this college
    const branches = await Branch.find({ collegeId });
    const branchIds = branches.map(branch => branch._id);

    // Delete all PDFs belonging to these branches
    await PDFDocument.deleteMany({ branchId: { $in: branchIds } });

    // Delete the branches
    await Branch.deleteMany({ collegeId });

    // Delete the college
    await College.findByIdAndDelete(collegeId);

    res.json({ msg: 'College and all nested branches and PDFs deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/branch
// @desc    Create a new branch under a college
// @access  Private
router.post('/branch', auth, async (req, res) => {
  const { name, collegeId } = req.body;

  if (!name || !collegeId) {
    return res.status(400).json({ msg: 'Please provide branch name and college identifier' });
  }

  try {
    const college = await College.findById(collegeId);
    if (!college) return res.status(404).json({ msg: 'College not found' });

    const newBranch = new Branch({ name, collegeId });
    const branch = await newBranch.save();
    res.json(branch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/branch/:id
// @desc    Update a branch name
// @access  Private
router.put('/branch/:id', auth, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ msg: 'Branch name is required' });
  }

  try {
    let branch = await Branch.findById(req.params.id);
    if (!branch) return res.status(404).json({ msg: 'Branch not found' });

    branch.name = name;
    await branch.save();
    res.json(branch);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/branch/:id
// @desc    Delete a branch and cascade delete associated PDF
// @access  Private
router.delete('/branch/:id', auth, async (req, res) => {
  try {
    const branchId = req.params.id;
    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ msg: 'Branch not found' });

    // Delete associated PDF
    await PDFDocument.deleteOne({ branchId });

    // Delete the branch
    await Branch.findByIdAndDelete(branchId);

    res.json({ msg: 'Branch and associated PDF deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/pdf/:branchId
// @desc    Upload or replace PDF for a branch
// @access  Private
router.post('/pdf/:branchId', auth, upload.single('pdf'), async (req, res) => {
  try {
    const { branchId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ msg: 'Branch not found' });

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a PDF file' });
    }

    // Standardize file name: CBIT_CSE_POLYCET_2025.pdf
    const college = await College.findById(branch.collegeId);
    const standardizedName = `${college.name}_${branch.name}_${college.exam}_2025.pdf`.replace(/\s+/g, '_');

    const pdfData = {
      filename: standardizedName,
      branchId,
      data: req.file.buffer,
      contentType: 'application/pdf'
    };

    // Upsert behavior: creates new or replaces existing PDF
    const pdf = await PDFDocument.findOneAndUpdate(
      { branchId },
      pdfData,
      { new: true, upsert: true }
    );

    res.json({ msg: 'PDF uploaded and assigned successfully', pdf });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/admin/pdf/:branchId
// @desc    Replace existing PDF (Alias to POST)
// @access  Private
router.put('/pdf/:branchId', auth, upload.single('pdf'), async (req, res) => {
  // Leverage identical logic as POST upsert
  try {
    const { branchId } = req.params;

    const branch = await Branch.findById(branchId);
    if (!branch) return res.status(404).json({ msg: 'Branch not found' });

    if (!req.file) {
      return res.status(400).json({ msg: 'Please upload a PDF file' });
    }

    const college = await College.findById(branch.collegeId);
    const standardizedName = `${college.name}_${branch.name}_${college.exam}_2025.pdf`.replace(/\s+/g, '_');

    const pdfData = {
      filename: standardizedName,
      branchId,
      data: req.file.buffer,
      contentType: 'application/pdf'
    };

    const pdf = await PDFDocument.findOneAndUpdate(
      { branchId },
      pdfData,
      { new: true, upsert: true }
    );

    res.json({ msg: 'PDF replaced successfully', pdf });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/admin/pdf/:id
// @desc    Delete a PDF document by its explicit ID
// @access  Private
router.delete('/pdf/:id', auth, async (req, res) => {
  try {
    const pdf = await PDFDocument.findById(req.params.id);
    if (!pdf) return res.status(404).json({ msg: 'PDF not found' });

    await PDFDocument.findByIdAndDelete(req.params.id);
    res.json({ msg: 'PDF deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/admin/college/:collegeId/bulk-upload
// @desc    Bulk upload branches and their PDFs for a college at once
// @access  Private (Admin Auth Required)
router.post('/college/:collegeId/bulk-upload', auth, upload.any(), async (req, res) => {
  const { collegeId } = req.params;

  try {
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(404).json({ msg: 'College not found' });
    }

    // req.files will contain the uploaded files
    // req.body will contain fields like branch_0, branch_1 matching files pdf_0, pdf_1
    const branchKeys = Object.keys(req.body).filter(key => key.startsWith('branch_'));
    const results = [];

    for (const key of branchKeys) {
      const index = key.split('_')[1];
      const branchName = req.body[key]?.trim()?.toUpperCase();
      if (!branchName) continue;

      const file = req.files.find(f => f.fieldname === `pdf_${index}`);
      
      // 1. Create or find the Branch
      let branch = await Branch.findOne({ name: branchName, collegeId });
      if (!branch) {
        branch = new Branch({ name: branchName, collegeId });
        await branch.save();
      }

      if (!file) {
        results.push({ branchName, status: 'Branch created without PDF (no file uploaded)' });
        continue;
      }

      // 2. Standardize PDF Name
      const standardizedName = `${college.name}_${branch.name}_${college.exam}_2025.pdf`.replace(/\s+/g, '_');

      // 3. Upsert the PDF
      const pdfData = {
        filename: standardizedName,
        branchId: branch._id,
        data: file.buffer,
        contentType: 'application/pdf'
      };

      await PDFDocument.findOneAndUpdate(
        { branchId: branch._id },
        pdfData,
        { new: true, upsert: true }
      );

      results.push({ branchName, filename: standardizedName, status: 'Success' });
    }

    res.json({ msg: 'Bulk upload completed successfully', results });
  } catch (err) {
    console.error('Bulk upload error:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
