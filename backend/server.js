require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

require('./db');
const authRoutes = require('./routes/auth');
const visitsRoutes = require('./routes/visits');
const feedbackRoutes = require('./routes/feedback');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/visits', visitsRoutes);
app.use('/api/feedback', feedbackRoutes);

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
