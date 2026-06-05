import { client } from "./redis.coonection.js";


class RedisService {
  constructor() {}

  async set(
    key: string,
    value: string | number | object,
    expire?: number
  ) {
    const options =
      expire && expire > 0 ? { EX: Math.floor(expire) } : {};

    if (typeof value === "object" && value !== null) {
      value = JSON.stringify(value);
    }

    return await client.set(key.toString(), value.toString(), options);
  }

  async get(key: string) {
    return await client.get(key);
  }

  // async mget(keys: string[]) {
  //   return await client.mGet(keys);
  // }

  async del(key: string) {
    return await client.del(key);
  }

  async exists(key: string) {
    return await client.exists(key);
  }

  async expire(key: string, expire: number) {
    return await client.expire(key, expire);
  }

  async ttl(key: string) {
    return await client.ttl(key);
  }

  async persist(key: string) {
    return await client.persist(key);
  }

  async update(
    key: string,
    value: string | number | object
  ) {
    if (!(await this.exists(key))) {
      return false;
    }

    await this.set(key, value);

    return true;
  }

  async inc(key: string) {
    return await client.incr(key);
  }

  async decr(key: string) {
    return await client.decr(key);
  }

  blockListTokenId(userId: string, tokenId: string) {
    return `blackList::${userId}::${tokenId}`;
  }

  getOTPkey(email: string, type: string) {
    return `otp::${email}::${type}`;
  }

  getOTPReqNOkey(email: string, type: string) {
    return `otp::${email}::${type}::NO`;
  }

  getOTPReqBlockkey(email: string, type: string) {
    return `otp::${email}::${type}::blocked`;
  }

  get2FALoginKey(email: string, type: string) {
    return `otp::${email}::${type}`;
  }

  get2FaOtpKey(email: string) {
    return `2fa::${email}`;
  }

  confirmEmailKey(email: string) {
    return `confirmEmail::${email}`;
  }
}

export default new RedisService();