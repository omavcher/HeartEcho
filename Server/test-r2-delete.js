const { deleteS3Object } = require("./utils/s3Upload");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Config = new S3Client({
  region: "auto",
  endpoint: "https://774b0770640ee47e3debc025f449ba36.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4e5d40c13a5ed3037d089b71f6dd6cb7",
    secretAccessKey: "d375ff53cf82681b0248a0bbccbc25794fea9f28d0a341a77576cc6a5c6a8dba",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const defaultBucket = "heartecho";
const bucket = process.env.R2_BUCKET || defaultBucket;

async function run() {
  const key = "ai_friends/images/test-delete-temp.txt";
  const cdnUrl = `https://cdn.heartecho.in/${key}`;
  
  // 1. Upload
  try {
    const uploadCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: "Hello world delete test with CDN",
      ContentType: "text/plain",
    });
    await s3Config.send(uploadCmd);
    console.log("Uploaded successfully to", key);
  } catch (err) {
    console.error("Upload failed:", err);
    return;
  }

  // 2. Delete using deleteS3Object
  try {
    const deleted = await deleteS3Object(cdnUrl);
    if (deleted) {
      console.log("Deleted successfully using deleteS3Object with URL:", cdnUrl);
    } else {
      console.error("Failed to delete using deleteS3Object");
    }
  } catch (err) {
    console.error("Deletion failed:", err);
  }
}

run();
