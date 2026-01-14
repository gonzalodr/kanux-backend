import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadLogoMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // maximum size 5MB
  fileFilter: (req, file, cb) => {
    // filter to file
    const filetypes = /image\/(png|svg\+xml|jpeg|jpg)/; 
    if (filetypes.test(file.mimetype)) {
      return cb(null, true);
    }
    
    cb(new Error('Only .png, .svg, .jpg and .jpeg formats are allowed'));
  },
});