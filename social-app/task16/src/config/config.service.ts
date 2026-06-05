import dotenv from "dotenv";
import path from "path";

export const NODE_ENV = process.env.NODE_ENV;

// const envPath = {
//   dev: path.resolve("./config/.env.dev"),
//   prod: path.resolve("./config/.env.prod"),
// };

dotenv.config({ path: path.resolve("./.env.dev") });

export const SERVER_PORT = process.env.PORT || 3000;
export const Database_URL = process.env.Database_URL as string;

export const REDIS_URL=process.env.REDIS_URL as string;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND as string);
export const ENYCRPTION_KEY = process.env.ENCRYPTION_KEY as string;
export const TOKEN_SIGNATURE_Admin_Access = process.env.TOKEN_SIGNATURE_Admin as string;
export const TOKEN_SIGNATURE_User_Access = process.env.TOKEN_SIGNATURE_User as string;
export const TOKEN_SIGNATURE_Admin_Refresh = process.env.TOKEN_SIGNATURE_Admin_Refresh as string;
export const TOKEN_SIGNATURE_User_Refresh= process.env.TOKEN_SIGNATURE_User_Refresh as string;
export const Client_Token_ID=process.env.Client_Token_ID as string;
export const MAIL_USER= process.env.MAIL_USER as string;
export const MAIL_PASS= process.env.MAIL_PASS as string;
