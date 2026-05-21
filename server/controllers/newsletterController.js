const Subscriber = require('../models/Subscriber');
const sendEmail = require('../utils/sendEmail');

const subscribeNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  try {
    // Attempt to create new subscriber
    const newSubscriber = await Subscriber.create({ email });

    // Send welcome email in background (fire-and-forget, no await to prevent latency)
    const welcomeHtml = `
      <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <!-- Gradient Accent Header -->
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 850; letter-spacing: -0.02em;">Welcome to TechBlogger! 🚀</h1>
          <p style="margin: 8px 0 0 0; font-size: 15px; color: #e9d5ff; font-weight: 500;">Your portal to engineering-focused knowledge</p>
        </div>
        
        <div style="padding: 24px; color: #334155;">
          <p style="font-size: 16px; line-height: 1.6; margin-top: 0; margin-bottom: 16px; font-weight: 600; color: #0f172a;">
            Hi there,
          </p>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
            Thank you for subscribing to our newsletter! You are now part of our software engineering community.
          </p>
          <p style="font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            You will now receive the best technical articles, tutorials, coding tips, and industry updates directly in your inbox as soon as they are published.
          </p>
          
          <!-- Key benefits box -->
          <div style="background-color: #f8fafc; border-left: 4px solid #7c3aed; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.05em;">What to expect:</h4>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #475569; line-height: 1.6;">
              <li>Fresh technical insights from experienced developers</li>
              <li>Hand-picked coding tutorials & architectural guides</li>
              <li>Real-time notifications on new posts</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-bottom: 0;">
            Stay curious, keep coding, and see you in the next post!
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #f1f5f9; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
            © ${new Date().getFullYear()} TechBlogger. All rights reserved.
          </p>
        </div>
      </div>
    `;

    sendEmail({
      to: email,
      subject: 'Welcome to the TechBlogger Newsletter! 🚀',
      html: welcomeHtml
    }).catch(err => {
      console.error('Failed to send welcome email to', email, err);
    });

    res.status(201).json({ message: 'Thank you for subscribing!' });
  } catch (error) {
    // Handle duplicate email key error from MongoDB (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This email is already subscribed!' });
    }
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

module.exports = { subscribeNewsletter };
