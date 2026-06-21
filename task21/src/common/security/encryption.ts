
import CryptoJS from "crypto-js";
import { ENYCRPTION_KEY } from "../../config/config.service.js";
export function encrptionData({data, ENYCRPTION_KEY}:{data:string,ENYCRPTION_KEY:string}) {
  const result = CryptoJS.AES.encrypt(data, ENYCRPTION_KEY).toString();
  return result;
}
export function decrptionData({value,key = ENYCRPTION_KEY}:{value:string,key:string}) {
  const result = CryptoJS.AES.decrypt(value, key );

  const originalData = result.toString(CryptoJS.enc.Utf8);
  return originalData;
}
