import dotenv from "dotenv";
import path from "path";

export const NODE_ENV = process.env.NODE_ENV;

const envPath = {
  dev: path.resolve("./config/.env.dev"),
  prod: path.resolve("./config/.env.prod"),
};

dotenv.config({ path: envPath[NODE_ENV || "dev"] });

export const SERVER_PORT = process.env.PORT || 3000;
export const Database_URL = process.env.Database_URL;

export const REDIS_URL=process.env.REDIS_URL;
export const SALT_ROUND = parseInt(process.env.SALT_ROUND);
export const ENYCRPTION_KEY = process.env.ENCRYPTION_KEY;
export const TOKEN_SIGNATURE_Admin_Access = process.env.TOKEN_SIGNATURE_Admin;
export const TOKEN_SIGNATURE_User_Access = process.env.TOKEN_SIGNATURE_User;
export const TOKEN_SIGNATURE_Admin_Refresh = process.env.TOKEN_SIGNATURE_Admin_Refresh;
export const TOKEN_SIGNATURE_User_Refresh= process.env.TOKEN_SIGNATURE_User_Refresh;
export const Client_Token_ID=process.env.Client_Token_ID;
export const MAIL_USER= process.env.MAIL_USER;
export const MAIL_PASS= process.env.MAIL_PASS;
