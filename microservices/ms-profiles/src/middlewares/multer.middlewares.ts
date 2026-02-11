import multer from 'multer';

const storage = multer.memoryStorage();

export const uploadImageProfiel = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {

    const filetypes = /image\/(png|svg\+xml|jpeg|jpg)/; 
    if (filetypes.test(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .svg, .jpg and .jpeg formats are allowed'));
  },
});