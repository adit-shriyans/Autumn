import mongoose, { Connection } from 'mongoose';

let isConnected = false;

export const connectToDB = async (): Promise<void> => {
    mongoose.set('strictQuery', true);

    if(isConnected) {
        console.log("MongoDB already connected", mongoose.connection.db.databaseName);
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            dbName: "pallotti",
        })

        isConnected = true;

        console.log("MongoDB connected", mongoose.connection.db.databaseName);
    } catch(error) {
        console.log(error);
    }
}