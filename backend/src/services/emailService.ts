import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // generated ethereal user
        pass: process.env.SMTP_PASS, // generated ethereal password
    },
});

export const sendStatusEmail = async (to: string, project: any, status: string) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn("SMTP credentials not found. Skipping email.");
            return;
        }

        const info = await transporter.sendMail({
            from: '"BRD Generator" <no-reply@brdgenerator.com>', // sender address
            to: to, // list of receivers
            subject: `Project Status Update: ${project.name}`, // Subject line
            text: `The status of your project "${project.name}" has been updated to: ${status}.`, // plain text body
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Project Status Update</h2>
                    <p>The status of your project <strong>${project.name}</strong> has been updated.</p>
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 0;">New Status: <strong style="text-transform: uppercase;">${status}</strong></p>
                    </div>
                    <p>Click <a href="${process.env.FRONTEND_URL}/projects/${project.id}/ingest">here</a> to view your project.</p>
                </div>
            `, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
