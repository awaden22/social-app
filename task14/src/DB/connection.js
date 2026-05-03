import { connect } from "mongoose";
import { Database_URL } from "../../config/config.service.js";

export async function testDBConnection() {
  try {
    await connect(Database_URL_ATLAS);
    console.log("connect success");
  } catch (error) {
    console.log("DB Connection Failed", error);
  }
}
