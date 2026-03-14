const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

// IMPORTANT: AWS SDK v3 ≥ 3.664 injects automatic CRC32 checksums into presigned
// PUT URLs (x-amz-checksum-crc32 / x-amz-sdk-checksum-algorithm).  When a plain
// browser PUT doesn't send the matching header, R2 returns a 400/403 error.
// Setting requestChecksumCalculation = WHEN_REQUIRED disables that behaviour
// so the presigned URL stays "clean" and usable from any HTTP client.
const s3Config = new S3Client({
  region: "auto",
  endpoint: "https://774b0770640ee47e3debc025f449ba36.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4e5d40c13a5ed3037d089b71f6dd6cb7",
    secretAccessKey: "d375ff53cf82681b0248a0bbccbc25794fea9f28d0a341a77576cc6a5c6a8dba",
  },
  requestChecksumCalculation: "WHEN_REQUIRED",   // ← disables automatic CRC32
  responseChecksumValidation: "WHEN_REQUIRED",   // ← disables auto validation too
});

const defaultBucket = "heartecho";
const CDN_URL = "https://cdn.heartecho.in";

/**
 * Generate a pre-signed PUT URL so the browser can upload directly to R2.
 * @param {string} folder - e.g. "live-stories/poster"
 * @param {string} filename - original file name
 * @param {string} contentType - MIME type
 * @returns {{ uploadUrl: string, key: string, cdnUrl: string }}
 */
const generatePresignedPutUrl = async (folder, filename, contentType) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(filename);
  const key = `${folder}/${uniqueSuffix}${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET || defaultBucket,
    Key: key,
    ContentType: contentType,
    // Do NOT add ChecksumAlgorithm here — that would re-introduce the requirement
  });

  const uploadUrl = await getSignedUrl(s3Config, command, {
    expiresIn: 3600,
    // Prevent any checksum headers from being hoisted into the query string
    unhoistableHeaders: new Set([
      "x-amz-checksum-crc32",
      "x-amz-sdk-checksum-algorithm",
    ]),
  });

  return {
    uploadUrl,
    key,
    cdnUrl: `${CDN_URL}/${key}`,
  };
};

// Legacy multer-s3 uploader (kept for backward compatibility if needed)
const uploadS3 = multer({
  storage: multerS3({
    s3: s3Config,
    bucket: process.env.R2_BUCKET || defaultBucket,
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `live-stories/${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
});

module.exports = { s3Config, uploadS3, generatePresignedPutUrl };
