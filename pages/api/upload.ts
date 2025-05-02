// pages/api/upload.ts

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import formidable from 'formidable';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false, // Use formidable for file parsing
  },
};

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload error' });

    const file = files.image[0];
    const fileContent = fs.readFileSync(file.filepath);
    const fileExtension = file.originalFilename?.split('.').pop();
    const key = `uploads/${uuidv4()}.${fileExtension}`;

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
          Body: fileContent,
          ContentType: file.mimetype,
        })
      );

      const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
      return res.status(200).json({ url });
    } catch (uploadErr) {
      return res.status(500).json({ error: 'S3 upload failed' });
    }
  });
}
