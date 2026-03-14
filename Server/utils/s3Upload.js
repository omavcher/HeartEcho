const { S3Client } = require("@aws-sdk/client-s3");
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

module.exports = { s3Config, uploadS3 };
