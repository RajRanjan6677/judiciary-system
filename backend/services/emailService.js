import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.MAIL_PORT || process.env.SMTP_PORT || '465', 10);

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for other ports (like 587)
    auth: {
        user: process.env.MAIL_USERNAME || process.env.SMTP_EMAIL, // generated ethereal user or your email
        pass: process.env.MAIL_PASSWORD || process.env.SMTP_PASSWORD, // generated ethereal password or app password
    },
});

/**
 * Sends an email notification when a new hearing is scheduled.
 * @param {Object} hearing - The hearing object
 * @param {Object} caseObj - The populated case object
 * @param {Object} lawyer - The lawyer user object (optional)
 * @param {Object} judge - The judge user object (optional)
 */
export const sendHearingCreationEmail = async (hearing, caseObj, lawyer, judge) => {
    try {
        const recipients = [];
        if (lawyer && lawyer.email) recipients.push(lawyer.email);
        if (judge && judge.email) recipients.push(judge.email);

        if (recipients.length === 0) {
            console.log('No recipients found for hearing creation email.');
            return;
        }

        const mailOptions = {
            from: `"Court Case Management System" <${process.env.MAIL_FROM || process.env.MAIL_USERNAME || process.env.SMTP_EMAIL}>`,
            to: recipients.join(', '),
            subject: `New Hearing Scheduled - Case ${caseObj.caseNumber}`,
            html: generateHearingHtml(hearing, caseObj, 'New Hearing Scheduled'),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Hearing creation email sent to: ${recipients.join(', ')} - Message ID: ${info.messageId}`);
    } catch (error) {
        console.error('[Email Service] Error sending hearing creation email:', error);
        // Do not throw error to avoid blocking the main API flow
    }
};

/**
 * Sends a reminder email for an upcoming hearing.
 * @param {Object} hearing - The hearing object
 * @param {Object} caseObj - The populated case object
 * @param {Object} lawyer - The lawyer user object (optional)
 * @param {Object} judge - The judge user object (optional)
 */
export const sendHearingReminderEmail = async (hearing, caseObj, lawyer, judge) => {
    try {
        const recipients = [];
        if (lawyer && lawyer.email) recipients.push(lawyer.email);
        if (judge && judge.email) recipients.push(judge.email);

        if (recipients.length === 0) {
            console.log('No recipients found for hearing reminder email.');
            return false; // Indicating failure to send due to no recipients
        }

        const mailOptions = {
            from: `"Court Case Management System" <${process.env.MAIL_FROM || process.env.MAIL_USERNAME || process.env.SMTP_EMAIL}>`,
            to: recipients.join(', '),
            subject: `REMINDER: Upcoming Hearing Tomorrow - Case ${caseObj.caseNumber}`,
            html: generateHearingHtml(hearing, caseObj, 'Upcoming Hearing Reminder'),
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email Service] Hearing reminder email sent to: ${recipients.join(', ')} - Message ID: ${info.messageId}`);
        return true; // Indicating success
    } catch (error) {
        console.error('[Email Service] Error sending hearing reminder email:', error);
        return false;
    }
};

// Helper function to generate professional HTML email
const generateHearingHtml = (hearing, caseObj, title) => {
    const formattedDate = new Date(hearing.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const formattedNextDate = hearing.nextHearingDate ? new Date(hearing.nextHearingDate).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }) : 'Not Scheduled';

    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #1a365d; color: white; padding: 20px; text-align: center;">
                <h2 style="margin: 0; font-size: 24px;">Court Case Management System</h2>
            </div>
            
            <div style="padding: 30px; background-color: #f8fafc;">
                <h3 style="color: #2d3748; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; margin-top: 0;">${title}</h3>
                
                <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
                    Please be advised of the following hearing details regarding <strong>Case No. ${caseObj.caseNumber}</strong>.
                </p>
                
                <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 20px; margin-top: 20px;">
                    <h4 style="margin-top: 0; color: #1a202c; font-size: 18px;">Case Information</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-weight: bold; width: 150px;">Case Number:</td>
                            <td style="padding: 8px 0; color: #2d3748;">${caseObj.caseNumber}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-weight: bold;">Case Title:</td>
                            <td style="padding: 8px 0; color: #2d3748;">${caseObj.title}</td>
                        </tr>
                    </table>
                    
                    <h4 style="margin-top: 20px; color: #1a202c; font-size: 18px;">Hearing Details</h4>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-weight: bold; width: 150px;">Hearing Date:</td>
                            <td style="padding: 8px 0; color: #e53e3e; font-weight: bold;">${formattedDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-weight: bold; vertical-align: top;">Remarks:</td>
                            <td style="padding: 8px 0; color: #2d3748;">${hearing.remarks || 'None'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #718096; font-weight: bold;">Next Hearing:</td>
                            <td style="padding: 8px 0; color: #2d3748;">${formattedNextDate}</td>
                        </tr>
                    </table>
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #718096; text-align: center;">
                    This is an automated message. Please do not reply to this email.
                </p>
            </div>
            
            <div style="background-color: #edf2f7; color: #a0aec0; padding: 15px; text-align: center; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Court Case Management System. All rights reserved.
            </div>
        </div>
    `;
};
