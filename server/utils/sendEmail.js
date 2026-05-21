const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const isPlaceholder = (val) => {
    if (!val) return true;
    const lower = val.toLowerCase();
    return lower.includes('your-email') || lower.includes('your-password') || lower.includes('placeholder');
  };

  // If credentials are not configured or are placeholders, simulate by logging to console
  if (isPlaceholder(process.env.EMAIL_USER) || isPlaceholder(process.env.EMAIL_PASS)) {
    console.log('\n⚠️  [EMAIL SIMULATION] SMTP credentials are not configured (or contain placeholders) in server/.env');
    console.log('👉 Please set real EMAIL_USER and EMAIL_PASS to receive actual emails on Gmail.');
    console.log(`📧 Simulated email details:`);
    console.log(`   - To: ${options.to}`);
    console.log(`   - Subject: ${options.subject}`);
    console.log(`   - Status: Simulated successfully\n`);
    return { simulated: true };
  }

  const transportConfig = {};
  
  if (!process.env.EMAIL_HOST || process.env.EMAIL_HOST === 'smtp.gmail.com') {
    transportConfig.service = 'gmail';
  } else {
    transportConfig.host = process.env.EMAIL_HOST;
    transportConfig.port = parseInt(process.env.EMAIL_PORT || '587', 10);
    transportConfig.secure = process.env.EMAIL_PORT === '465';
  }
  
  transportConfig.auth = {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  };

  // Enable debugging in nodemailer if needed
  transportConfig.debug = true;
  transportConfig.logger = true;

  try {
    const transporter = nodemailer.createTransport(transportConfig);

    const fromEmail = process.env.EMAIL_FROM || `"TechBlogger" <${process.env.EMAIL_USER}>`;
    const mailOptions = {
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    console.log(`📬 Attempting to send real email to: ${options.to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${options.to}! MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ SMTP Error occurred while sending email to ${options.to}:`);
    console.error(error);
    
    if (error.message.includes('535') || error.message.includes('Authentication')) {
      console.error('\n💡 TROUBLESHOOTING HINT:');
      console.error('It looks like a Gmail login/authentication failure.');
      console.error('Make sure you have:');
      console.error('1. Enabled 2-Step Verification on your Gmail account.');
      console.error('2. Generated a 16-character "App Password" (NOT your regular password).');
      console.error('3. Copied that 16-character code without spaces into EMAIL_PASS in server/.env.\n');
    }
    
    throw error;
  }
};

module.exports = sendEmail;

