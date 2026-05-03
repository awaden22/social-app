import { compare, hash } from "bcrypt";
import { SALT_ROUND } from "../../../config/config.service.js";

export async function hashOperation({plainText , rounds = SALT_ROUND}){
    return await hash(plainText, rounds)
    
}
export async function compareOperation({plainValue , hashValue}){
    return await compare (plainValue,hashValue);
}