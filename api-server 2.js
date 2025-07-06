const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, adminAuth } = require('./middleware/auth');
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://digiclickai.netlify.app', 'https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3002']
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiters
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per window
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500 // Higher limit for admin routes
});

// Apply rate limiting to routes
app.use('/api/contact', publicLimiter);
app.use('/api/demo', publicLimiter);
app.use('/api/services', publicLimiter);
app.use('/api/admin', adminLimiter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digiclick-ai';
mongoose.connect(mongoUri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema for authentication
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

const User = mongoose.model('User', userSchema);

// Other Schemas
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    message: { type: String, required: true },
    serviceInterest: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
});

// Add compound index for common query patterns
contactSchema.index({ email: 1, createdAt: -1 });

const demoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    company: { type: String },
    demoTime: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, index: true },
});

// Add compound index for common query patterns
demoSchema.index({ email: 1, demoTime: 1 });

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    description: { type: String, required: true },
});

// Add text index for search functionality
serviceSchema.index({ title: 'text', description: 'text' });

const Contact = mongoose.model('Contact', contactSchema);
const Demo = mongoose.model('Demo', demoSchema);
const Service = mongoose.model('Service', serviceSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'DigiClick AI API is running' });
});

// Contact form endpoint with fallback
app.post('/api/contact', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
    body('serviceInterest').optional().trim(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, message, serviceInterest } = req.body;

        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            const contact = new Contact({ name, email, message, serviceInterest });
            await contact.save();
            res.status(201).json({ message: `Thank you, ${name}! Your message has been received.` });
        } else {
            // Fallback: log to console and return success (for demo purposes)
            console.log('Contact form submission (MongoDB not connected):', {
                name, email, message, serviceInterest, timestamp: new Date()
            });
            res.status(201).json({ message: `Thank you, ${name}! Your message has been received.` });
        }
    } catch (error) {
        console.error('Contact form error:', error);
        // Still return success for demo purposes
        res.status(201).json({ message: `Thank you! Your message has been received.` });
    }
});

// Automation demo endpoint
app.post('/api/demo', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('company').optional().trim(),
    body('demoTime').trim().notEmpty().withMessage('Demo time is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, company, demoTime } = req.body;
        const demo = new Demo({ name, email, company, demoTime });
        await demo.save();
        res.status(201).json({ message: `Demo scheduled for ${demoTime}, ${name}!` });
    } catch (error) {
        console.error('Demo scheduling error:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Services endpoint with fallback
app.get('/api/services', async (req, res) => {
    try {
        // Check if MongoDB is connected
        if (mongoose.connection.readyState === 1) {
            const services = await Service.find({}, {
                _id: 0,
                __v: 0,
                title: 1,
                description: 1
            }).lean();
            res.status(200).json(services);
        } else {
            // Fallback to static services if MongoDB is not connected
            const fallbackServices = [
                { title: 'AI-Crafted Websites', description: 'Design visionary websites with AI-driven aesthetics that captivate and convert.' },
                { title: 'Predictive Marketing', description: 'Harness AI to anticipate trends and optimize campaigns for unparalleled results.' },
                { title: 'Intelligent SEO', description: 'Elevate your search rankings with AI-powered strategies and dynamic content.' },
                { title: 'Automation Ecosystems', description: 'Streamline operations with bespoke AI automation for seamless efficiency.' },
                { title: 'Custom AI Apps', description: 'Integrate intelligent apps to enhance your business and customer experience.' }
            ];
            res.status(200).json(fallbackServices);
        }
    } catch (error) {
        console.error('Services fetch error:', error);
        // Fallback to static services on error
        const fallbackServices = [
            { title: 'AI-Crafted Websites', description: 'Design visionary websites with AI-driven aesthetics that captivate and convert.' },
            { title: 'Predictive Marketing', description: 'Harness AI to anticipate trends and optimize campaigns for unparalleled results.' },
            { title: 'Intelligent SEO', description: 'Elevate your search rankings with AI-powered strategies and dynamic content.' },
            { title: 'Automation Ecosystems', description: 'Streamline operations with bespoke AI automation for seamless efficiency.' },
            { title: 'Custom AI Apps', description: 'Integrate intelligent apps to enhance your business and customer experience.' }
        ];
        res.status(200).json(fallbackServices);
    }
});

// Authentication Routes
app.post('/api/auth/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('adminKey').equals(process.env.ADMIN_REGISTRATION_KEY || 'your-default-admin-key')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        // Create new admin user
        const user = new User({
            email,
            password,
            isAdmin: true
        });
        await user.save();

        res.status(201).json({ message: 'Admin user created successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || 'your-default-secret-key',
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Protected Admin Routes
app.get('/api/contacts', adminAuth, async (req, res) => {
    try {
        const contacts = await Contact.find({}, {
            _id: 0,
            __v: 0,
            name: 1,
            email: 1,
            message: 1,
            serviceInterest: 1,
            createdAt: 1
        }).sort({ createdAt: -1 }).lean();
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Contacts fetch error:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

app.get('/api/demos', adminAuth, async (req, res) => {
    try {
        const demos = await Demo.find({}, {
            _id: 0,
            __v: 0,
            name: 1,
            email: 1,
            company: 1,
            demoTime: 1,
            createdAt: 1
        }).sort({ createdAt: -1 }).lean();
        res.status(200).json(demos);
    } catch (error) {
        console.error('Demos fetch error:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Seed initial services data
async function seedServices() {
    try {
        const services = [
            { title: 'AI-Crafted Websites', description: 'Design visionary websites with AI-driven aesthetics that captivate and convert.' },
            { title: 'Predictive Marketing', description: 'Harness AI to anticipate trends and optimize campaigns for unparalleled results.' },
            { title: 'Intelligent SEO', description: 'Elevate your search rankings with AI-powered strategies and dynamic content.' },
            { title: 'Automation Ecosystems', description: 'Streamline operations with bespoke AI automation for seamless efficiency.' },
            { title: 'Custom AI Apps', description: 'Integrate intelligent apps to enhance your business and customer experience.' },
        ];

        const count = await Service.countDocuments();
        if (count === 0) {
            await Service.insertMany(services);
            console.log('Services seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding services:', error);
    }
}

// Initialize services after MongoDB connection
mongoose.connection.once('open', () => {
    seedServices();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(port, () => {
    console.log(`DigiClick AI API server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
