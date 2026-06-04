import { randomUUID } from "node:crypto";

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  Access_Key_Id,
  Application_Name,
  Bucket_Name,
  Region,
  Secret_Access_Key,
} from "../../config/config.service.js";
import { Upload } from "@aws-sdk/lib-storage";
import { StorgeApproachEnum } from "../enums/multer.enums.js";
import { createReadStream } from "node:fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3BuketService {
  private _client = new S3Client({
    region: Region,
    credentials: {
      accessKeyId: Access_Key_Id,
      secretAccessKey: Secret_Access_Key,
    },
  });

  async upload({ file, path }: { file: Express.Multer.File; path: string }) {
    const command = new PutObjectCommand({
      Bucket: Bucket_Name,
      Key: `${Application_Name}/${path}/${randomUUID()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.private,
    });

    await this._client.send(command);
    return command.input.Key;
  }
  async creatPreSigneUrl({
    file,
    path,
  }: {
    file: Express.Multer.File;
    path: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: Bucket_Name,
      Key: `${Application_Name}/${path}/${randomUUID()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.private,
    });

   const url = await getSignedUrl(this._client, command, {
  expiresIn:3600} )

  
    return {key:command.input.Key!, url};
  }

  async uploadLargeFile({
    file,
    path,
    uploadApproach = StorgeApproachEnum.Disk,
  }: {
    file: Express.Multer.File;
    path: string;
    uploadApproach?: StorgeApproachEnum;
  }) {
    const parallelUploads3 = new Upload({
      client: this._client,
      params: {
        Bucket: Bucket_Name,
        Key: `${Application_Name}/${path}/${randomUUID()}_${file.originalname}`,
        Body:
          uploadApproach == StorgeApproachEnum.Memory
            ? file.buffer
            : createReadStream(file.path),
        ContentType: file.mimetype,
        ACL: ObjectCannedACL.private,
      },

      partSize: 1024 * 1024 * 5,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      console.log(
        `file Uploading ${((progress.loaded as number) / (progress.total as number)) * 100}%`,
      );
    });

    const uploadFile = await parallelUploads3.done();
    return uploadFile.Key!;
  }
  async uploadfiles({
    files,
    path,
    uplaodApproach = StorgeApproachEnum.Memory,
  }: {
    files: Express.Multer.File[];
    path: string;
    uplaodApproach?: StorgeApproachEnum.Memory;
  }) {
    const keys = await Promise.all(
      files.map((file) => {
        return uplaodApproach == StorgeApproachEnum.Memory
          ? this.upload({ file, path: "user" })
          : this.uploadLargeFile({
              file,
              path,
              uploadApproach: StorgeApproachEnum.Disk,
            });
      }),
    );
    return keys;
  }
  async getFile({key}:{key:string}){
    const command = new GetObjectCommand({
      Bucket:Bucket_Name,
      Key:key
    })
    return this._client.send(command)
  }
  async deleteFile(key:string){
    const command = new DeleteObjectCommand({
      Bucket:Bucket_Name,
      Key:key
      
    })
    return this._client.send(command)
  }
}
export default new S3BuketService();
