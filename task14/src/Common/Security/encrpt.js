import CryptoJS from "crypto-js";
export function encrptionData(data, ENYCRPTION_KEY) {
  const result = CryptoJS.AES.encrypt(data, ENYCRPTION_KEY).toString();
  return result;
}
export function decrptionData(value,key = ENYCRPTION_KEY) {
  const result = CryptoJS.AES.decrypt(value, key );

  const originalData = result.toString(CryptoJS.enc.Utf8);
  return originalData;
}
