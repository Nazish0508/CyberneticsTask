// pages/api/upload.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file parsing
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const form = new formidable.IncomingForm();

  // Parse the form
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Form parsing error' });
    }

    const file = files.image as File[]; // Type assertion to handle the uploaded file
    if (!file || file.length === 0) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageFile = file[0];
    const fileContent = fs.readFileSync(imageFile.filepath);
    const fileExtension = imageFile.originalFilename?.split('.').pop();
    const key = `uploads/${uuidv4()}.${fileExtension}`;

    const contentType = imageFile.mimetype || 'application/octet-stream'; // Fallback if mimetype is null

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
          Body: fileContent,
          ContentType: contentType, // Ensure ContentType is always a string
        })
      );

      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
      return res.status(200).json({ url });
    } catch (uploadErr) {
      console.error('S3 upload error:', uploadErr);
      return res.status(500).json({ error: 'S3 upload failed' });
    }
  });
}
