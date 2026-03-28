import mongoose from "mongoose";

export const connectDB = () => {
    mongoose.connect(process.env.MONGO_URL)
        .then(conn => {
            console.log(`MongoDB connected ${conn.connection.host}`);
        })
        .catch(err => {
            console.log(err);
            process.exit(1);
        });
};