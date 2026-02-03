import mongoose, { connect } from "mongoose";

const connectDB = async () =>{
    try {

        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/authcrud');

        console.log("Database Connected Successfully");

    } catch (error) {
        console.log("Database is not connect",error);
    }
}

export default connectDB;