import { createTransport } from "nodemailer";
import { MAIL_USER,MAIL_PASS } from "../../../config/config.service.js";

// Create a transporter using SMTP
let transporter = createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
   tls: {
    rejectUnauthorized: false
  }
});
async function sendMail({to, subject,text,html,attachments}) {
    

await transporter.sendMail({
  from: `Route <${MAIL_USER}>`, 
 to,
 subject,
 text,
 html,
 attachments
});
}


export default sendMail