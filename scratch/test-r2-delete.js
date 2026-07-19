const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config({ path: "../Server/.env" });

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
  console.log("Bucket:", bucket);
  const key = "test-delete-temp.txt";
  
  // 1. Upload
  try {
    const uploadCmd = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: "Hello world delete test",
      ContentType: "text/plain",
    });
    await s3Config.send(uploadCmd);
    console.log("Uploaded successfully!");
  } catch (err) {
    console.error("Upload failed:", err);
    return;
  }

  // 2. Delete
  try {
    const deleteCmd = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    await s3Config.send(deleteCmd);
    console.log("Deleted successfully from R2!");
  } catch (err) {
    console.error("Deletion failed:", err);
  }
}

run();
