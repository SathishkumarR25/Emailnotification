require("dotenv").config();

const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
const path=require('path');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'emailnotification.html')); // Ensure this file exists
});
const port = process.env.PORT || 2500;

let primaryFailures = 0;



const primaryTransporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: process.env.primaryemail,
        pass: process.env.primarypwd
    }
});



const backupTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.backupemail,
        pass: process.env.backuppwd
    }
});

function sendEmail(transporter, mailOptions) {
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return reject(error);
            }
            resolve(info);
        });
    });
}

async function trySendEmail(mailOptions) {
    try {
        
        await sendEmail(primaryTransporter, mailOptions);
        primaryFailures = 0; 
        return { success: true, message: 'Email sent successfully via primary Mail.' };
    } catch (primaryError) {
        primaryFailures += 1;
        console.error('Primary email service failed:', primaryError.message);

        
        if (primaryFailures >= 3) {
            try {
                
                await sendEmail(backupTransporter, mailOptions);
                primaryFailures = 0; 
                return { success: true, message: 'Email sent successfully via backup Mail.' };
            } catch (backupError) {
                console.error('Backup email service failed:', backupError.message);
               
                return { success: false, message: 'All email services failed.' };
            }
        }

       
       
    }
}

app.post('/send-email', async (req, res) => {
    const { to, subject, text } = req.body;
    
    const mailOptions = {
        from: process.env.primaryemail,
        to,
        subject,
        text
    };
    
    const result = await trySendEmail(mailOptions);
    console.log('Email send result:', JSON.stringify(result, null, 2));
    res.json(result);
});



app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
