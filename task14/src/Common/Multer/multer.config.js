import multer from "multer";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { randomUUID } from "node:crypto";

export const allowedFileFormat = {
  img: ["image/png", "image/jpg"],
  videos: ["video/mp4"],
  pdf: ["application/pdf"],
};

export function localUpload({
  folderName = "GeneralFiles",
  allowedformat = allowedFileFormat.img,
  fileSize=1
} = {}) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const fullPath = `./uploads/${folderName}`;
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
      cb(null, path.resolve(fullPath));
    },
    filename: function (req, file, cb) {
      const fileName = randomUUID() + "_" + file.originalname;
      file.finalPath=`./uploads/${folderName}/${fileName}`
      cb(null, fileName);
    },
  });

  function fileFilter(req, file, cb) {
    if (!allowedformat.includes(file.mimetype)) {
      return cb(new Error("invalid format"), false);
    }
    cb(null, true);
  }

  return multer({ storage, fileFilter,limits:fileSize*1024*1024 });
}