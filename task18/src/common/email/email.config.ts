import { createTransport } from "nodemailer";
import { MAIL_PASS, MAIL_USER } from "../../config/config.service.js";
import type { Attachment } from "nodemailer/lib/mailer/index.js";


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
async function sendMail({to, subject,text,html,attachments}:{
    to:string|string[],
    subject:string,
    text:string,
    html?:string,
    attachments?:Attachment[]
}) {
    

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