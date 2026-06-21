import multer from "multer";
import { StorgeApproachEnum } from "../common/enums/multer.enums.js";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { fileFilter, allowedFileFormat } from "./multer.validation.js";

function cloudFileUpload({
  storgeApproach = StorgeApproachEnum.Memory,
  allowedFormat = allowedFileFormat.img,
  size = 5,
}: {
  allowedFormat?: string[];
  storgeApproach?: StorgeApproachEnum;
  size?: number;
} = {}) {
  const storage =
    storgeApproach == StorgeApproachEnum.Memory
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: (req, file, callback) => {
            callback(null, tmpdir());
          },
          filename: (req, file, callback) => {
            callback(null, `${randomUUID()}_${file.originalname}`);
          },
        });

  return multer({
    storage,
    fileFilter: fileFilter(allowedFormat),
    limits: {
      fileSize: size * 1024 * 1024,
    },
  });
}
export default cloudFileUpload;
