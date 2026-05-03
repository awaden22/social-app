import { client } from "./redis.connection.js";

export async function set(key, value, expire) {
  const options = expire && expire > 0 ? { EX: Math.floor(expire) } : {};
  // Redis accepts only strings or buffers.
  if (typeof value === "object" && value !== null) {
    value = JSON.stringify(value);
  }
  return await client.set(key.toString(), value, options);
}
export async function get(key) {
  return await client.get(key);
}
export async function mget(keys) {
  return await client.mGet(keys);
}
export async function del(key) {
  return client.del(key);
}
export async function exist(key) {
  return await client.exists(key);
}
export async function expire(key, expire) {
  return await client.expire(key, expire);
}
export async function ttl(key) {
  return await client.ttl(key);
}
export async function persist(key) {
  return await client.persist(key);
}
export async function update(key, value) {
  if (!(await exist(key))) {
    return false;
  }

  await set(key, value);
  return true;
}
export async function inc(key) {
  return await client.incr(key);
}
export async function decr(key) {
  return await client.decr(key);
}
export async function exists(key) {
  return await client.exists(key);
}


export function blockListTokenId(userId, TokenId) {
  return `blackList::${userId}::${TokenId}`;
}
export function getOTPkey(email, type) {
  return `otp::${email}::${type}`;
}
export function getOTPReqNOkey(email, type) {
  return `otp::${email}::${type}::NO`;
}
export function getOTPReqBlockkey(email, type) {
  return `otp::${email}::${type}::blocked`;
}
export function get2FALoginKey(email, type) {
  return `otp::${email}::${type}`;
}
export function get2FaOtpKey(email) {
  return `2fa::${email}`;
}
export function confirmEmailKey(email) {
  return `confirmEmail::${email}`;
}
