import { v2 as cloudinary } from 'cloudinary';



export const uploadToCloudinary = (fileBuffer: Buffer, profileId: string): Promise<any> => {

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
      folder: 'profile_image',
      public_id: profileId,
      overwrite: true,
      resource_type: 'auto',
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    }
    );
    // send direct to buffer
    uploadStream.end(fileBuffer);
  });
};