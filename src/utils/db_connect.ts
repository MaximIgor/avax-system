import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const MONGDB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGDB_NAME = process.env.MONGODB_NAME || 'avax';

const ConnectDB = async () => {
    try {
        await mongoose.connect(`${MONGDB_URI}/${MONGDB_NAME}`);
        console.log("MongoDB connect successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};

export default ConnectDB;
