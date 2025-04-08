import mongoose from 'mongoose';

const {MONGODB_URI} = process.env

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
    );
}

let cached = (globalThis as any).mongoose;

if (!cached) {
    cached = (globalThis as any).mongoose = {conn: null, promise: null};
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export {dbConnect};
