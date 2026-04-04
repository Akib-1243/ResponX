import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("connected", () => {
        console.log("Database connected");
    });

    mongoose.connection.on("error", (err) => {
        console.error("Database connection error:", err.message);
    });

    await mongoose.connect(process.env.MONGODB_URL);
};

export default connectDB;