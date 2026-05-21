const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '.env') });

const sendEmail = require('./utils/sendEmail');

const runTest = async () => {
  console.log('🏁 Starting SMTP Email Test...');
  console.log(`- EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.gmail.com (default)'}`);
  console.log(`- EMAIL_PORT: ${process.env.EMAIL_PORT || '587 (default)'}`);
  console.log(`- EMAIL_USER: ${process.env.EMAIL_USER}`);
  console.log(`- EMAIL_PASS: ${process.env.EMAIL_PASS ? '****** (configured)' : '(not configured)'}`);
  
  const testRecipient = process.argv[2] || process.env.EMAIL_USER;
  
  if (!testRecipient || testRecipient.includes('your-email')) {
    console.error('\n❌ Error: Please specify a recipient email address.');
    console.error('Usage: node test-email.js <recipient-email-address>');
    console.error('Or configure a valid EMAIL_USER in server/.env\n');
    process.exit(1);
  }

  console.log(`- Sending test email to: ${testRecipient}`);

  try {
    const result = await sendEmail({
      to: testRecipient,
      subject: 'Test Email from TechBlogger! 🚀',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2>SMTP Connection Test</h2>
          <p>If you are reading this message, your SMTP configuration on TechBlogger is working perfectly! 🎉</p>
          <p>Sent at: <strong>${new Date().toLocaleString()}</strong></p>
        </div>
      `
    });

    if (result && result.simulated) {
      console.log('\n⚠️  The test email was SIMULATED. No actual email was sent because the credentials are still placeholders.');
    } else {
      console.log('\n🎉 SUCCESS! Test email has been sent to Gmail successfully!');
    }
  } catch (error) {
    console.error('\n❌ SMTP test failed.');
  }
};

runTest();
