import {v2 as cloudinary} from 'cloudinary'
import cloudinaryI from '../../useCase/interface/cloudinaryRepo'
import dotenv from 'dotenv'

dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})


class Cloudinary implements cloudinaryI{
  async uploadImage(image: any, folderName: string): Promise<string> { 
      try {
       const uploadResult = await cloudinary.uploader
       .upload(
        image,{
            folder:`${folderName}`,
            resource_type:'image'
        }
       )
       return uploadResult.secure_url
      } catch (error) {
        console.error("Error uploading image to cloudinary",error);
        throw error
      }
  }

  

  async uploadVideo(video: any, folderName: string): Promise<string> {
    try {    
      console.log('video',video);
        
        const uploadResult = await cloudinary.uploader.upload(video, {
            folder: `${folderName}`,
            resource_type: 'video',
        });        
        return uploadResult.secure_url;
    } catch (error) {
        console.error("Error uploading video to Cloudinary", error);
        throw error;
    }
}

  async uploadMultipleimages(images: any[], folderName: string): Promise<string[]> {
      try {
    
          const uploadPromises = images.map(async(image)=>{
            console.log(image);
            
            const uploadResult = await cloudinary.uploader.upload(image,{
                folder:folderName,
                resource_type:'image'
            })
            return uploadResult.secure_url
          })
          const uploadUrls = await Promise.all(uploadPromises)
          return uploadUrls
      } catch (error) {
        console.error("Error uploading image to cloudinary",error);
        throw error
      }
  }

 async uploadAudio(audio: any, folderName: string): Promise<string> {
  try { 
    const uploadResult = await cloudinary.uploader.upload(audio, {
      folder: `${folderName}`,
      resource_type: 'video', // 'video' can also be used for audio files
      format: 'mp3',  // Use 'raw' for audio files
    });
    console.log('uploadResult',uploadResult.secure_url);
    
    return uploadResult.secure_url;
  } catch (error) {
    console.error('Error uploading audio to Cloudinary', error);
    throw error;
  }
}
}

export default Cloudinary
