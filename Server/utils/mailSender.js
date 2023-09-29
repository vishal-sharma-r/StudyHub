const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try{
            // let transporter = nodemailer.createTransport({
            //     host:process.env.MAIL_HOST,
            //     auth:{
            //         user: process.env.MAIL_USER,
            //         pass: process.env.MAIL_PASS,
            //     }
            // })
            const transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'isabel.cormier@ethereal.email',
                    pass: 'EDHfgayRMGNzxyJaZG'
                }
            });


            let info = await transporter.sendMail({
                from: 'StudyHub || Vishal Sharma',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            console.log(info);
            return info;
    }
    catch(error) {
        console.log(error.message);
    }
}


module.exports = mailSender;