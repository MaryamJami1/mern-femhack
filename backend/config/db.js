import mongoose from 'mongoose';

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected`);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
   
  }
};

export default connectDb;