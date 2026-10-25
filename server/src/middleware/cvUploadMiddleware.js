const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const {
  CV_DIRECTORY,
  ensureCvDirectory,
} = require("../services/cvStorageService");

ensureCvDirectory();

const allowedMimeTypes = new Set([
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    cb
  ) => {
    cb(null, CV_DIRECTORY);
  },

  filename: (
    req,
    file,
    cb
  ) => {
    const extension =
      path.extname(file.originalname)
        .toLowerCase();

    const uniqueName =
      `${req.user.id}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    !allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    return cb(
      new Error(
        "Only PDF, DOC and DOCX files are allowed."
      )
    );
  }

  cb(null, true);
};

const uploadCv = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadCv;