import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config()


 const connectDB = async ()=>{
     try{
        const mongo_uri = process.env.MONGO_URI
        if(mongo_uri){
            const connectionInstance = await mongoose.connect(mongo_uri)
            console.log(`\n MogoDB connected ! ! DB HOST: ${connectionInstance.connection.host}`);

        }

     }catch(error){
        console.log("Error connecting to MongoDB",error)
        process.exit(1)  
     }
}

export {connectDB}



