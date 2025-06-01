const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
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

// Rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/digiclick-ai';
mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Schemas
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    serviceInterest: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const demoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String },
    demoTime: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const serviceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
});

const Contact = mongoose.model('Contact', contactSchema);
const Demo = mongoose.model('Demo', demoSchema);
const Service = mongoose.model('Service', serviceSchema);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'DigiClick AI API is running' });
});

// Contact form endpoint
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
        const contact = new Contact({ name, email, message, serviceInterest });
        await contact.save();
        res.status(201).json({ message: `Thank you, ${name}! Your message has been received.` });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
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

// Services endpoint
app.get('/api/services', async (req, res) => {
    try {
        const services = await Service.find();
        res.status(200).json(services);
    } catch (error) {
        console.error('Services fetch error:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Get all contacts (admin endpoint - should be protected in production)
app.get('/api/contacts', async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(contacts);
    } catch (error) {
        console.error('Contacts fetch error:', error);
        res.status(500).json({ error: 'Server error, please try again later.' });
    }
});

// Get all demos (admin endpoint - should be protected in production)
app.get('/api/demos', async (req, res) => {
    try {
        const demos = await Demo.find().sort({ createdAt: -1 });
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
