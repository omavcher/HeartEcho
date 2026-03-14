/**
 * Run this once to set up CORS on the Cloudflare R2 bucket
 * so that browsers can PUT files directly to it.
 *
 * Usage: node scripts/setupR2Cors.js
 */

const { S3Client, PutBucketCorsCommand, GetBucketCorsCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://774b0770640ee47e3debc025f449ba36.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4e5d40c13a5ed3037d089b71f6dd6cb7",
    secretAccessKey: "d375ff53cf82681b0248a0bbccbc25794fea9f28d0a341a77576cc6a5c6a8dba",
  },
});

const BUCKET = "heartecho";

const corsConfig = {
  CORSRules: [
    {
      // Allow direct browser uploads from any origin (lock down in production)
      AllowedOrigins: ["*"],
      AllowedMethods: ["PUT", "GET", "HEAD"],
      AllowedHeaders: ["*"],
      ExposeHeaders: ["ETag"],
      MaxAgeSeconds: 3600,
    },
  ],
};

async function main() {
  console.log("Setting CORS rules on bucket:", BUCKET);
  try {
    await s3.send(
      new PutBucketCorsCommand({ Bucket: BUCKET, CORSConfiguration: corsConfig })
    );
    console.log("✅ CORS rules applied successfully.");

    // Verify
    const result = await s3.send(new GetBucketCorsCommand({ Bucket: BUCKET }));
    console.log("Current CORS rules:", JSON.stringify(result.CORSRules, null, 2));
  } catch (err) {
    console.error("❌ Error applying CORS:", err.message);
    process.exit(1);
  }
}

main();
