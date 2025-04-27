import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import taskRoutes from './routes/taskRoutes.js'; 
import connetDb from './config/db.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

//connect DB
connetDb()
// port
const port = process.env.PORT || 5000
// Routes
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
