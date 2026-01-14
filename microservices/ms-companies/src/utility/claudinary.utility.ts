import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (fileBuffer: Buffer, companyId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream({
        folder: 'logo_company',
        public_id: companyId,
        overwrite: true,
        resource_type: 'auto',
      },(error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    // send direct to buffer
    uploadStream.end(fileBuffer);
  });
};