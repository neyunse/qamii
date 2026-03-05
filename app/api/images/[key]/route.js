import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function GET(req, { params }) {
  try {
    const unwrappedParams = await params;
    const key = unwrappedParams.key;

    if (!key) {
      return NextResponse.json({ message: "No image key provided" }, { status: 400 });
    }

    if (!R2_BUCKET_NAME) {
      console.error("R2_BUCKET_NAME is not defined in environment variables");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const decodedKey = decodeURIComponent(key);

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: decodedKey,
    });

    const response = await s3Client.send(command);

    // Convert the ReadableStream to a Response stream
    return new NextResponse(response.Body, {
      headers: {
        'Content-Type': response.ContentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ message: "Image not found" }, { status: 404 });
    }
    console.error("Error fetching image from R2:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
