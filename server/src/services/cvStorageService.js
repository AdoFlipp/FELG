const fs = require("fs");
const path = require("path");

const CV_DIRECTORY = path.join(
  __dirname,
  "../../uploads/cv"
);

const ensureCvDirectory = () => {
  if (!fs.existsSync(CV_DIRECTORY)) {
    fs.mkdirSync(CV_DIRECTORY, {
      recursive: true,
    });
  }
};

const deleteFile = (filePath) => {
  if (
    filePath &&
    fs.existsSync(filePath)
  ) {
    fs.unlinkSync(filePath);
  }
};

module.exports = {
  CV_DIRECTORY,
  ensureCvDirectory,
  deleteFile,
};