import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExt = ['.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowedExt.includes(ext));
};

const upload = multer({ storage, fileFilter });
export default upload;