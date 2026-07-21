import { Request, Response } from 'express';

export const handleFileUpload = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  
  // Return the file path or URL so the client can save it in the database
  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ message: 'File uploaded successfully', url: fileUrl });
};

export const handleMultipleFileUpload = (req: Request, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }

  const urls = req.files.map(file => `/uploads/${file.filename}`);
  return res.json({ message: 'Files uploaded successfully', urls });
};
