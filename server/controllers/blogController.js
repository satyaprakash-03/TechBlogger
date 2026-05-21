const Blog = require('../models/Blog');
const Notification = require('../models/Notification');

const getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true }).populate('author', 'name avatar socialLinks designation bio').sort({ createdAt: -1 });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name avatar socialLinks designation bio');
    if (blog) {
      res.json(blog);
      // Asynchronously update views in the background
      Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }).catch(err => {
        console.error('Background view update error:', err);
      });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBlog = async (req, res) => {
  const { title, content, excerpt, slug, category, tags, coverImage } = req.body;
  try {
    const blog = new Blog({
      title, content, excerpt, slug, category, tags, coverImage,
      author: req.user._id,
    });
    const createdBlog = await blog.save();

    // Trigger publish notifications for all other users
    if (createdBlog.isPublished) {
      try {
        const User = require('../models/User');
        const otherUsers = await User.find({ _id: { $ne: req.user._id } }, '_id');
        if (otherUsers.length > 0) {
          const notifications = otherUsers.map(u => ({
            receiver: u._id,
            sender: req.user._id,
            type: 'publish',
            title: 'New Article Published',
            message: `${req.user.name} published a new article: "${createdBlog.title}"`,
            link: `/blogs/${createdBlog._id}`
          }));
          await Notification.insertMany(notifications);
        }

        // Broadcast email to all newsletter subscribers in the background
        try {
          const Subscriber = require('../models/Subscriber');
          const sendEmail = require('../utils/sendEmail');
          const subscribers = await Subscriber.find({}, 'email');
          
          if (subscribers.length > 0) {
            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            const blogUrl = `${clientUrl}/blogs/${createdBlog._id}`;
            
            subscribers.forEach(sub => {
              const emailHtml = `
                <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; border: 1px solid #e4e4e7; border-radius: 16px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                  <!-- Banner / Cover Image -->
                  ${createdBlog.coverImage ? `
                    <div style="width: 100%; max-height: 280px; overflow: hidden;">
                      <img src="${createdBlog.coverImage}" alt="${createdBlog.title}" style="width: 100%; height: auto; display: block; object-fit: cover;" />
                    </div>
                  ` : ''}
                  
                  <div style="padding: 24px;">
                    <!-- Category Badge -->
                    <span style="font-size: 12px; font-weight: 700; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em; background-color: #f5f3ff; padding: 6px 12px; border-radius: 6px; display: inline-block; margin-bottom: 16px;">
                      ${createdBlog.category || 'Technology'}
                    </span>
                    
                    <!-- Title -->
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 850; margin: 0 0 8px 0; line-height: 1.3; letter-spacing: -0.02em;">
                      ${createdBlog.title}
                    </h1>
                    
                    <!-- Author & Date -->
                    <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
                      <span style="font-weight: 600; color: #334155;">by ${req.user.name}</span>
                      <span style="color: #cbd5e1; margin: 0 8px;">•</span>
                      <span>${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    
                    <!-- Excerpt / Summary -->
                    <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                      ${createdBlog.excerpt || 'A new article has been published on TechBlogger. Click the link below to read the full content.'}
                    </p>
                    
                    <!-- CTA Button -->
                    <div style="margin-bottom: 16px;">
                      <a href="${blogUrl}" style="background-color: #7c3aed; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">
                        Read Full Article →
                      </a>
                    </div>
                  </div>
                  
                  <!-- Footer -->
                  <div style="background-color: #f8fafc; padding: 20px 24px; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                      You received this email because you subscribed to the TechBlogger newsletter.
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #94a3b8; font-weight: 500;">
                      © ${new Date().getFullYear()} TechBlogger. All rights reserved.
                    </p>
                  </div>
                </div>
              `;
              
              sendEmail({
                to: sub.email,
                subject: `New Article: "${createdBlog.title}" 🚀`,
                html: emailHtml
              }).catch(err => {
                console.error(`Failed to send newsletter email to ${sub.email}:`, err);
              });
            });
          }
        } catch (emailError) {
          console.error('Newsletter email broadcast error:', emailError);
        }
      } catch (notifyError) {
        console.error('Notification trigger error:', notifyError);
      }
    }

    res.status(201).json(createdBlog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      const isAdmin = req.user && req.user.role === 'admin' && req.user.email === 'satyaprakash.in33@gmail.com';
      if (blog.author.toString() !== req.user._id.toString() && !isAdmin) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      
      const { title, content, excerpt, slug, category, tags, coverImage } = req.body;
      blog.title = title || blog.title;
      blog.content = content || blog.content;
      blog.excerpt = excerpt || blog.excerpt;
      blog.slug = slug || blog.slug;
      blog.category = category || blog.category;
      blog.tags = tags || blog.tags;
      blog.coverImage = coverImage || blog.coverImage;

      const updatedBlog = await blog.save();
      res.json(updatedBlog);
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (blog) {
      const isAdmin = req.user && req.user.role === 'admin' && req.user.email === 'satyaprakash.in33@gmail.com';
      if (blog.author.toString() !== req.user._id.toString() && !isAdmin) {
        return res.status(401).json({ message: 'Not authorized' });
      }
      await blog.deleteOne();
      res.json({ message: 'Blog removed' });
    } else {
      res.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const isLiked = blog.likes.some(id => id.toString() === req.user._id.toString());
    if (isLiked) {
      // Unlike blog
      blog.likes = blog.likes.filter(id => id.toString() !== req.user._id.toString());
      await blog.save();

      // Delete the corresponding like notification if exists
      await Notification.deleteOne({
        receiver: blog.author,
        sender: req.user._id,
        type: 'like',
        link: `/blogs/${blog._id}`
      });

      res.json({ message: 'Blog unliked', likes: blog.likes });
    } else {
      // Like blog
      blog.likes.push(req.user._id);
      await blog.save();

      // Notify author (if someone else liked the blog)
      if (blog.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          receiver: blog.author,
          sender: req.user._id,
          type: 'like',
          title: 'New Like',
          message: `${req.user.name} liked your blog "${blog.title}"`,
          link: `/blogs/${blog._id}`
        });
      }

      res.json({ message: 'Blog liked', likes: blog.likes });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, likeBlog };
