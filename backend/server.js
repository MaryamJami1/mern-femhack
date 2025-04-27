import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js'; 
import connetDb from './config/db.js';

dotenv.config();
const app = express();

// CORS configuration for production URL
const corsOptions = {
  origin: [
    'https://mern-femhack.vercel.app',  // Vercel ka frontend URL
    'https://mern-femhack-production-0e5d.up.railway.app', // Railway ka production URL
    'http://localhost:5173', // Local development frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true, // Agar cookies ya sessions use kar rahe hain
};





app.use(cors(corsOptions)); // Apply specific CORS options
app.use(express.json());

// DB connection
connetDb();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
