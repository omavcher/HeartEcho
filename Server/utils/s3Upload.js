const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");

const s3Config = new S3Client({
  region: "auto",
  endpoint: "https://774b0770640ee47e3debc025f449ba36.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "4e5d40c13a5ed3037d089b71f6dd6cb7",
    secretAccessKey: "d375ff53cf82681b0248a0bbccbc25794fea9f28d0a341a77576cc6a5c6a8dba",
  },
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
  });

  const uploadUrl = await getSignedUrl(s3Config, command, { expiresIn: 3600 });

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
