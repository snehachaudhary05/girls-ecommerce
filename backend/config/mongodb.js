import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('Connected to MongoDB')
        })

        const uri = process.env.MONGODB_URI
        if (!uri || !(uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
            console.error('Invalid or missing MONGODB_URI:', uri)
            throw new Error('MONGODB_URI is not set or invalid. Ensure .env is loaded and value starts with mongodb:// or mongodb+srv://')
        }

        await mongoose.connect(uri)
    } catch (error) {
        console.log(error.message)
    }
}

export default connectDB;
