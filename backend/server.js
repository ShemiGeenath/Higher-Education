const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests

// Serve static files (e.g., uploaded images)
app.use('/uploads', express.static('uploads'));

// Routes
const teacherRoute = require('./routes/teacherRoute');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');

app.use('/api/teachers', teacherRoute);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
