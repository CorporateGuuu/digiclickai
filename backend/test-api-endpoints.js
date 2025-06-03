const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Contact = require('./models/Contact');
const Demo = require('./models/Demo');
const Newsletter = require('./models/Newsletter');

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');
const User = require('./models/User');
const Contact = require('./models/Contact');
const Demo = require('./models/Demo');
const Newsletter = require('./models/Newsletter');

let server;
let authToken;
let adminToken;

console.log('🚀 Starting API Endpoint Tests...\n');

async function setup() {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digiclick-test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  
  server = app.listen(5001);
  
  // Create test admin user
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'Password123!',
    role: 'admin'
  });
  
  // Create test regular user
  const regularUser = await User.create({
    name: 'Test User',
    email: 'user@test.com',
    password: 'Password123!'
  });
  
  // Get tokens
  const adminLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@test.com', password: 'Password123!' });
  adminToken = adminLogin.body.token;
  
  const userLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'user@test.com', password: 'Password123!' });
  authToken = userLogin.body.token;
}

async function teardown() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await server.close();
}

setup().then(() => {
  // Run tests here or export functions for test runner
  console.log('Setup complete. Ready to run tests.');
}).catch(err => {
  console.error('Setup failed:', err);
});

// 1. Authentication Endpoints
describe('Authentication Endpoints', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'New User',
          email: 'new@test.com',
          password: 'Password123!',
          passwordConfirm: 'Password123!'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.user).toHaveProperty('name', 'New User');
    });
    
    it('should handle validation errors', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Invalid',
          email: 'invalid-email',
          password: '123'
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!'
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
    
    it('should handle invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@test.com',
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(401);
    });
  });
  
  describe('GET /api/v1/auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'user@test.com');
    });
    
    it('should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile');
      
      expect(res.status).toBe(401);
    });
  });
});

// 2. Contact Form Endpoints
describe('Contact Form Endpoints', () => {
  let contactId;
  
  describe('POST /api/v1/contact', () => {
    it('should submit contact form', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Test Contact',
          email: 'contact@test.com',
          message: 'Test message',
          service: 'AI Web Design',
          gdprConsent: true
        });
      
      contactId = res.body.contact._id;
      expect(res.status).toBe(201);
      expect(res.body.contact).toHaveProperty('name', 'Test Contact');
    });
    
    it('should handle invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/contact')
        .send({
          name: 'Test',
          email: 'invalid-email'
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
  
  describe('GET /api/v1/contact', () => {
    it('should get all contacts (admin)', async () => {
      const res = await request(app)
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.contacts)).toBe(true);
    });
    
    it('should handle unauthorized access', async () => {
      const res = await request(app)
        .get('/api/v1/contact')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(403);
    });
  });
});

// 3. Demo Request Endpoints
describe('Demo Request Endpoints', () => {
  let demoId;
  
  describe('POST /api/v1/demo', () => {
    it('should submit demo request', async () => {
      const res = await request(app)
        .post('/api/v1/demo')
        .send({
          name: 'Test Demo',
          email: 'demo@test.com',
          company: 'Test Company',
          industry: 'Technology',
          gdprConsent: true
        });
      
      demoId = res.body.demo._id;
      expect(res.status).toBe(201);
      expect(res.body.demo).toHaveProperty('name', 'Test Demo');
    });
  });
  
  describe('GET /api/v1/demo/stats/overview', () => {
    it('should get demo statistics (admin)', async () => {
      const res = await request(app)
        .get('/api/v1/demo/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stats');
    });
  });
});

// 4. Newsletter Endpoints
describe('Newsletter Endpoints', () => {
  describe('POST /api/v1/newsletter/subscribe', () => {
    it('should subscribe to newsletter', async () => {
      const res = await request(app)
        .post('/api/v1/newsletter/subscribe')
        .send({
          email: 'subscriber@test.com',
          gdprConsent: true
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Successfully subscribed');
    });
    
    it('should handle duplicate subscription', async () => {
      const res = await request(app)
        .post('/api/v1/newsletter/subscribe')
        .send({
          email: 'subscriber@test.com',
          gdprConsent: true
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Already subscribed');
    });
  });
});

// 5. AI Service Endpoints
describe('AI Service Endpoints', () => {
  describe('POST /api/v1/ai/chat', () => {
    it('should process chat request', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Hello AI',
          context: { previousMessages: [] }
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('response');
    });
  });
  
  describe('GET /api/v1/ai/status', () => {
    it('should get AI service status', async () => {
      const res = await request(app)
        .get('/api/v1/ai/status')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
    });
  });
});

// 6. Error Handling Tests
describe('Error Handling', () => {
  it('should handle 404 routes', async () => {
    const res = await request(app)
      .get('/api/v1/nonexistent');
    
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'API endpoint not found');
  });
  
  it('should handle validation errors', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({});
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
  });
  
  it('should handle rate limiting', async () => {
    for (let i = 0; i < 101; i++) {
      await request(app).post('/api/v1/auth/login');
    }
    
    const res = await request(app)
      .post('/api/v1/auth/login');
    
    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty('message');
  });
});

// 7. Security Tests
describe('Security Features', () => {
  it('should prevent XSS attacks', async () => {
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: '<script>alert("xss")</script>Test',
        email: 'test@test.com',
        message: 'Test message',
        service: 'AI Web Design',
        gdprConsent: true
      });
    
    expect(res.body.contact.name).not.toContain('<script>');
  });
  
  it('should handle SQL injection attempts', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: "' OR '1'='1",
        password: "' OR '1'='1"
      });
    
    expect(res.status).toBe(401);
  });
});

// 8. Performance Tests
describe('Performance', () => {
  it('should handle large payloads', async () => {
    const largeMessage = 'x'.repeat(50000);
    
    const res = await request(app)
      .post('/api/v1/contact')
      .send({
        name: 'Test',
        email: 'test@test.com',
        message: largeMessage,
        service: 'AI Web Design',
        gdprConsent: true
      });
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
  
  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill().map(() => 
      request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(res => {
      expect(res.status).toBe(200);
    });
  });
});

console.log('✅ API Endpoint Tests Complete!\n');
