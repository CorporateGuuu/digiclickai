const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'digiclick-ai-super-secret-key-2024';

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://digiclickai.com', 'https://digiclickai.netlify.app']
    : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digiclick-ai';
mongoose.connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your_email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your_app_password',
    },
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Schemas
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    message: { type: String, required: true, trim: true },
    serviceInterest: { type: String, trim: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const demoSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    company: { type: String, trim: true },
    demoTime: { type: String, required: true },
    phone: { type: String, trim: true },
    requirements: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
});

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    icon: { type: String },
    features: [{ type: String }],
    price: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const portfolioSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    results: { type: String, required: true, trim: true },
    imageUrl: { type: String },
    technologies: [{ type: String }],
    clientName: { type: String, trim: true },
    projectUrl: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    createdAt: { type: Date, default: Date.now },
});

// Models
const Contact = mongoose.model('Contact', contactSchema);
const Demo = mongoose.model('Demo', demoSchema);
const Service = mongoose.model('Service', serviceSchema);
const Portfolio = mongoose.model('Portfolio', portfolioSchema);
const User = mongoose.model('User', userSchema);

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied - No token provided'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    const healthStatus = {
        status: 'OK',
        message: 'DigiClick AI API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        email: process.env.EMAIL_USER ? 'Configured' : 'Not configured'
    };
    res.status(200).json(healthStatus);
});

// Contact form endpoint
app.post('/api/contact', [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be between 10 and 1000 characters'),
    body('serviceInterest')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Service interest must be less than 100 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array(),
            message: 'Validation failed'
        });
    }

    try {
        const { name, email, message, serviceInterest } = req.body;
        
        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            const contact = new Contact({
                name,
                email,
                message,
                serviceInterest,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            await contact.save();

            console.log(`📧 New contact submission from ${name} (${email})`);

            // Send email notification to client
            try {
                if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
                    await transporter.sendMail({
                        from: `"DigiClick AI" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: 'Thank You for Contacting DigiClick AI',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #00d4ff;">Thank You, ${name}!</h2>
                                <p>Your message has been received and we appreciate your interest in our AI-powered solutions.</p>
                                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                    <h3>Your Message:</h3>
                                    <p><strong>Service Interest:</strong> ${serviceInterest || 'General Inquiry'}</p>
                                    <p><strong>Message:</strong> ${message}</p>
                                </div>
                                <p>Our team will review your inquiry and get back to you within 24 hours.</p>
                                <p style="color: #666;">Best regards,<br>The DigiClick AI Team</p>
                            </div>
                        `,
                    });

                    // Send notification to admin
                    await transporter.sendMail({
                        from: `"DigiClick AI" <${process.env.EMAIL_USER}>`,
                        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
                        subject: `New Contact Form Submission from ${name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                <h2 style="color: #00d4ff;">New Contact Form Submission</h2>
                                <p><strong>Name:</strong> ${name}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Service Interest:</strong> ${serviceInterest || 'General Inquiry'}</p>
                                <p><strong>Message:</strong></p>
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px;">
                                    ${message}
                                </div>
                                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                                <p><strong>IP Address:</strong> ${req.ip}</p>
                            </div>
                        `,
                    });
                }
            } catch (emailError) {
                console.error('❌ Email sending error:', emailError);
                // Don't fail the request if email fails
            }

            res.status(201).json({
                success: true,
                message: `Thank you, ${name}! Your message has been received. We'll get back to you soon.`
            });
        } else {
            // Fallback: log to console
            console.log('📧 Contact form submission (MongoDB not connected):', {
                name, email, message, serviceInterest,
                timestamp: new Date().toISOString(),
                ip: req.ip
            });
            res.status(201).json({
                success: true,
                message: `Thank you, ${name}! Your message has been received.`
            });
        }
    } catch (error) {
        console.error('❌ Contact form error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error, please try again later.',
            message: 'We apologize for the inconvenience. Please try again or contact us directly.'
        });
    }
});

// Demo scheduling endpoint
app.post('/api/demo', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('company').optional().trim().isLength({ max: 100 }),
    body('demoTime').trim().notEmpty().withMessage('Demo time is required'),
    body('phone').optional().trim().isMobilePhone().withMessage('Valid phone number required'),
    body('requirements').optional().trim().isLength({ max: 500 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }

    try {
        const { name, email, company, demoTime, phone, requirements } = req.body;
        
        if (mongoose.connection.readyState === 1) {
            const demo = new Demo({ name, email, company, demoTime, phone, requirements });
            await demo.save();
            console.log(`🎯 New demo scheduled: ${name} - ${demoTime}`);
        } else {
            console.log('🎯 Demo request (MongoDB not connected):', {
                name, email, company, demoTime, phone, requirements,
                timestamp: new Date().toISOString()
            });
        }
        
        res.status(201).json({ 
            success: true,
            message: `Demo scheduled for ${demoTime}, ${name}! We'll send you a confirmation email shortly.`
        });
    } catch (error) {
        console.error('❌ Demo scheduling error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error, please try again later.' 
        });
    }
});

// Services endpoint with fallback
app.get('/api/services', async (req, res) => {
    try {
        let services;
        
        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            services = await Service.find({ isActive: true }).sort({ order: 1 });
            
            // If no services in database, return fallback
            if (services.length === 0) {
                services = getFallbackServices();
            }
        } else {
            services = getFallbackServices();
        }
        
        res.status(200).json({
            success: true,
            data: services,
            count: services.length
        });
    } catch (error) {
        console.error('❌ Services fetch error:', error);
        res.status(200).json({
            success: true,
            data: getFallbackServices(),
            count: 5
        });
    }
});

// Fallback services data
function getFallbackServices() {
    return [
        {
            title: 'AI-Crafted Websites',
            description: 'Design visionary websites with AI-driven aesthetics that captivate and convert.',
            icon: '🌐',
            features: ['Responsive Design', 'AI-Powered UX', 'Performance Optimized']
        },
        {
            title: 'Predictive Marketing',
            description: 'Harness AI to anticipate trends and optimize campaigns for unparalleled results.',
            icon: '📊',
            features: ['Trend Analysis', 'Campaign Optimization', 'ROI Prediction']
        },
        {
            title: 'Intelligent SEO',
            description: 'Elevate your search rankings with AI-powered strategies and dynamic content.',
            icon: '🔍',
            features: ['Keyword Research', 'Content Optimization', 'Rank Tracking']
        },
        {
            title: 'Automation Ecosystems',
            description: 'Streamline operations with bespoke AI automation for seamless efficiency.',
            icon: '⚡',
            features: ['Workflow Automation', 'Process Optimization', 'Integration Solutions']
        },
        {
            title: 'Custom AI Apps',
            description: 'Integrate intelligent apps to enhance your business and customer experience.',
            icon: '🤖',
            features: ['Custom Development', 'AI Integration', 'Scalable Solutions']
        }
    ];
}

// Fallback portfolio data
function getFallbackPortfolios() {
    return [
        {
            title: 'AI-Driven E-commerce Platform',
            description: 'Built a dynamic online store with personalized AI recommendations and smart inventory management.',
            category: 'e-commerce',
            results: '50% increase in sales, 30% boost in customer retention',
            technologies: ['React', 'Node.js', 'TensorFlow', 'MongoDB'],
            clientName: 'TechMart Solutions',
            imageUrl: 'https://via.placeholder.com/600x400?text=E-commerce+Platform'
        },
        {
            title: 'Smart SaaS Analytics Dashboard',
            description: 'Developed an AI-powered SaaS dashboard with predictive analytics and real-time insights.',
            category: 'saas',
            results: '40% improvement in user engagement, 25% increase in subscription renewals',
            technologies: ['Vue.js', 'Python', 'PostgreSQL', 'AWS'],
            clientName: 'DataFlow Inc.',
            imageUrl: 'https://via.placeholder.com/600x400?text=SaaS+Dashboard'
        },
        {
            title: 'Automated Hospitality System',
            description: 'Created an AI-powered booking and management system for luxury hotels with smart room allocation.',
            category: 'automation',
            results: '60% reduction in manual tasks, 35% increase in booking efficiency',
            technologies: ['Angular', 'Express.js', 'MySQL', 'Azure'],
            clientName: 'Luxury Stays Group',
            imageUrl: 'https://via.placeholder.com/600x400?text=Hotel+Management'
        }
    ];
}

// Get all contacts (admin endpoint)
app.get('/api/admin/contacts', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
            res.status(200).json({
                success: true,
                data: contacts,
                count: contacts.length
            });
        } else {
            res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }
    } catch (error) {
        console.error('❌ Contacts fetch error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Server error, please try again later.' 
        });
    }
});

// Get all demos (admin endpoint)
app.get('/api/admin/demos', async (req, res) => {
    try {
        if (mongoose.connection.readyState === 1) {
            const demos = await Demo.find().sort({ createdAt: -1 }).limit(100);
            res.status(200).json({
                success: true,
                data: demos,
                count: demos.length
            });
        } else {
            res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }
    } catch (error) {
        console.error('❌ Demos fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error, please try again later.'
        });
    }
});

// Portfolio endpoint
app.get('/api/portfolio', async (req, res) => {
    try {
        let portfolios;

        if (mongoose.connection.readyState === 1) {
            portfolios = await Portfolio.find({ isActive: true }).sort({ order: 1 });

            if (portfolios.length === 0) {
                portfolios = getFallbackPortfolios();
            }
        } else {
            portfolios = getFallbackPortfolios();
        }

        res.status(200).json({
            success: true,
            data: portfolios,
            count: portfolios.length
        });
    } catch (error) {
        console.error('❌ Portfolio fetch error:', error);
        res.status(200).json({
            success: true,
            data: getFallbackPortfolios(),
            count: 3
        });
    }
});

// User signup
app.post('/api/auth/signup', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { name, email, password } = req.body;

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                error: 'Database not available for user registration'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'Email already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`👤 New user registered: ${name} (${email})`);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            message: 'User created successfully'
        });
    } catch (error) {
        console.error('❌ Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error, please try again later.'
        });
    }
});

// User login
app.post('/api/auth/login', [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    try {
        const { email, password } = req.body;

        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                error: 'Database not available for login'
            });
        }

        const user = await User.findOne({ email, isActive: true });
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log(`🔐 User logged in: ${user.name} (${email})`);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: user.lastLogin
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error, please try again later.'
        });
    }
});

// User demo schedules (protected)
app.get('/api/user/demos', authenticateToken, async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                error: 'Database not available'
            });
        }

        const demos = await Demo.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            data: demos,
            count: demos.length
        });
    } catch (error) {
        console.error('❌ User demos fetch error:', error);
        res.status(500).json({
            success: false,
            error: 'Server error, please try again later.'
        });
    }
});

// Seed initial data
async function seedData() {
    try {
        if (mongoose.connection.readyState === 1) {
            // Seed services
            const serviceCount = await Service.countDocuments();
            if (serviceCount === 0) {
                const services = getFallbackServices().map((service, index) => ({
                    ...service,
                    order: index + 1
                }));

                await Service.insertMany(services);
                console.log('🌱 Services seeded successfully');
            }

            // Seed portfolios
            const portfolioCount = await Portfolio.countDocuments();
            if (portfolioCount === 0) {
                const portfolios = getFallbackPortfolios().map((portfolio, index) => ({
                    ...portfolio,
                    order: index + 1
                }));

                await Portfolio.insertMany(portfolios);
                console.log('🌱 Portfolios seeded successfully');
            }
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// Initialize data after MongoDB connection
mongoose.connection.once('open', () => {
    console.log('🔗 MongoDB connection established');
    seedData();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err.stack);
    res.status(500).json({ 
        success: false,
        error: 'Something went wrong!',
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    mongoose.connection.close(() => {
        console.log('📦 MongoDB connection closed');
        process.exit(0);
    });
});

// Start server
app.listen(port, () => {
    console.log(`🚀 DigiClick AI API server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📡 API Base URL: http://localhost:${port}/api`);
    console.log(`🏥 Health Check: http://localhost:${port}/api/health`);
});

module.exports = app;
