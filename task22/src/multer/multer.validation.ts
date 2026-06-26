
import type { FileFilterCallback } from "multer";
import { BadRequestException } from "../common/exceptions/domain.exception.js";
import type { Request } from "express";

export const allowedFileFormat = {
  img: ["image/png", "image/jpeg"],
  videos: ["video/mp4"],
  pdf: ["application/pdf"],
};
export function fileFilter(allowedFileFormat:string[]) {
 return(req: Request,
             file: Express.Multer.File,
             callback: FileFilterCallback)=>{
 
    if (!allowedFileFormat.includes(file.mimetype)){
      return callback(new BadRequestException("invalid format"));
    }
    callback(null, true);
  }
}