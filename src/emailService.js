require('dotenv').config();

const aws = require("aws-sdk");
aws.config.update({region:'us-east-1'});
const ses = new aws.SES({ apiVersion: "2010-12-01" });
const sender = process.env.EMAIL_SENDER;
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    SES:ses
})

const headers = [
    {key:"X-SES-SOURCE-ARN",value:process.env.HEADER_SOURCE_ARN},
    {key:"X-SES-RETURN-PATH-ARN",value:process.env.HEADER_RETURN_PATH_ARN},
    {key:"X-SES-FROM-ARN",value:process.env.HEADER_FROM_ARN}
]


class EmailService {

    static async sendRawEmail(to, subject, data, attachments){
        let mailOptions = {
          headers,
          from: sender,
          to,
          subject,
          html:data,
      }
      if(attachments) mailOptions.attachments = attachments;
        try{
            let info = await transporter.sendMail(mailOptions);
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }catch(err){
            console.log(err)
            throw err;
        }
    
      }
}

module.exports = EmailService;