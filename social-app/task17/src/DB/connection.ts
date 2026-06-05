import { connect } from "mongoose";
import { Database_URL } from "../config/config.service.js";

async function testDBConnection(){
    try{
      await connect(Database_URL)
      console.log("DB connected")
    }catch(error){
        console.log("DB Connection Failed")
    }

}

export default testDBConnection;