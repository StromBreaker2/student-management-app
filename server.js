const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas.'))
  .catch((err) => {
    console.error('ERROR: Could not connect to MongoDB.', err.message);
    process.exit(1);
  });

// Schema
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll_number: { type: String, required: true, unique: true },
  course: { type: String, required: true },
  grade: { type: String }
});

const Student = mongoose.model('Student', studentSchema);

// Get all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ _id: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add student
app.post('/api/students', async (req, res) => {
  const { name, roll_number, course, grade } = req.body;
  if (!name || !roll_number || !course) {
    return res.status(400).json({ error: 'Name, Roll Number, and Course are required fields.' });
  }
  try {
    const student = await Student.create({ name, roll_number, course, grade });
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Roll number already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  const { name, roll_number, course, grade } = req.body;
  if (!name || !roll_number || !course) {
    return res.status(400).json({ error: 'Name, Roll Number, and Course are required fields.' });
  }
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, roll_number, course, grade },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json(student);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Roll number already exists.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
