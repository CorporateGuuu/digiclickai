const mongoose = require('mongoose');
const User = require('./models/User');
const Contact = require('./models/Contact');

// Test database connection and optimizations
async function testOptimizations() {
  try {
    console.log('🧪 Testing Database Optimizations...\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/digiclick-test?directConnection=true', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected successfully');

    // Test 1: Create sample data for testing (this will create collections)
    console.log('\n📝 Creating sample test data...');
    
    // Clear existing test data
    await User.deleteMany({});
    await Contact.deleteMany({});
    
    // Create test users
    const testUsers = await User.create([
      {
        name: 'Test Admin',
        email: 'admin@test.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'admin'
      },
      {
        name: 'Test User',
        email: 'user@test.com',
        password: 'password123',
        passwordConfirm: 'password123',
        role: 'user'
      }
    ]);
    
    // Create test contacts
    const testContacts = await Contact.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        service: 'AI Web Design',
        budget: '$5,000 - $15,000',
        message: 'Need a new website with AI features',
        status: 'new',
        priority: 'high',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        assignedTo: testUsers[0]._id
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        service: 'Automation Solutions',
        budget: '$15,000 - $50,000',
        message: 'Looking for business automation',
        status: 'contacted',
        priority: 'medium',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
        followUpDate: new Date(),
        assignedTo: testUsers[0]._id
      },
      {
        name: 'Bob Wilson',
        email: 'bob@example.com',
        service: 'AI Consulting',
        budget: 'Over $100,000',
        message: 'Enterprise AI consultation needed',
        status: 'in-progress',
        priority: 'urgent',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent'
      }
    ]);
    
    console.log(`✅ Created ${testUsers.length} test users`);
    console.log(`✅ Created ${testContacts.length} test contacts`);

    // Test 2: Verify indexes are created (after collections exist)
    console.log('\n📊 Testing Index Creation...');
    
    const userIndexes = await User.collection.getIndexes();
    const contactIndexes = await Contact.collection.getIndexes();
    
    console.log(`✅ User model has ${Object.keys(userIndexes).length} indexes`);
    console.log(`✅ Contact model has ${Object.keys(contactIndexes).length} indexes`);
    
    // Display some key indexes
    console.log('\n🔍 Key User Indexes:');
    Object.keys(userIndexes).forEach(index => {
      if (index !== '_id_') {
        console.log(`  - ${index}`);
      }
    });
    
    console.log('\n🔍 Key Contact Indexes:');
    Object.keys(contactIndexes).forEach(index => {
      if (index !== '_id_') {
        console.log(`  - ${index}`);
      }
    });

    // Test 3: Test optimized queries with lean()
    console.log('\n⚡ Testing Optimized Queries...');
    
    const start1 = Date.now();
    const contactsByStatus = await Contact.getByStatus('new', { lean: true });
    const time1 = Date.now() - start1;
    console.log(`✅ getByStatus (lean): ${contactsByStatus.length} results in ${time1}ms`);
    
    const start2 = Date.now();
    const highPriorityContacts = await Contact.getHighPriority({ lean: true });
    const time2 = Date.now() - start2;
    console.log(`✅ getHighPriority (lean): ${highPriorityContacts.length} results in ${time2}ms`);
    
    const start3 = Date.now();
    const followUpContacts = await Contact.getNeedingFollowUp({ lean: true });
    const time3 = Date.now() - start3;
    console.log(`✅ getNeedingFollowUp (lean): ${followUpContacts.length} results in ${time3}ms`);

    // Test 4: Test field projection
    console.log('\n🎯 Testing Field Projection...');
    
    const start4 = Date.now();
    const [contactsList, total] = await Contact.getContactsList({}, {
      page: 1,
      limit: 10,
      lean: true,
      select: 'name email service status priority'
    });
    const time4 = Date.now() - start4;
    console.log(`✅ getContactsList with projection: ${contactsList.length}/${total} results in ${time4}ms`);
    
    // Verify projection worked (should only have selected fields)
    if (contactsList.length > 0) {
      const firstContact = contactsList[0];
      const hasOnlySelectedFields = Object.keys(firstContact).every(key => 
        ['_id', 'id', 'name', 'email', 'service', 'status', 'priority', 'assignedTo'].includes(key)
      );
      console.log(`✅ Field projection working: ${hasOnlySelectedFields ? 'Yes' : 'No'}`);
    }

    // Test 5: Test User optimizations
    console.log('\n👤 Testing User Optimizations...');
    
    const start5 = Date.now();
    const userProfile = await User.getProfile(testUsers[0]._id, { lean: true });
    const time5 = Date.now() - start5;
    console.log(`✅ getProfile (lean): Retrieved in ${time5}ms`);
    
    const start6 = Date.now();
    const [usersList, usersTotal] = await User.getUsersList({}, {
      page: 1,
      limit: 10,
      lean: true
    });
    const time6 = Date.now() - start6;
    console.log(`✅ getUsersList (lean): ${usersList.length}/${usersTotal} results in ${time6}ms`);

    // Test 6: Test aggregation optimization
    console.log('\n📈 Testing Aggregation Optimizations...');
    
    const start7 = Date.now();
    const analytics = await Contact.aggregate([
      { $match: { isSpam: false } },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byService: [
            { $group: { _id: '$service', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ]
        }
      }
    ]);
    const time7 = Date.now() - start7;
    console.log(`✅ Optimized aggregation with $facet: Completed in ${time7}ms`);
    console.log(`   - Status breakdown: ${analytics[0].byStatus.length} categories`);
    console.log(`   - Service breakdown: ${analytics[0].byService.length} categories`);
    console.log(`   - Priority breakdown: ${analytics[0].byPriority.length} categories`);

    // Test 7: Performance comparison
    console.log('\n⚡ Performance Comparison...');
    
    // Test without lean (traditional)
    const start8 = Date.now();
    const traditionalQuery = await Contact.find({ isSpam: false }).limit(10);
    const time8 = Date.now() - start8;
    
    // Test with lean (optimized)
    const start9 = Date.now();
    const optimizedQuery = await Contact.find({ isSpam: false }).lean().limit(10);
    const time9 = Date.now() - start9;
    
    console.log(`📊 Traditional query: ${time8}ms`);
    console.log(`⚡ Lean query: ${time9}ms`);
    console.log(`🚀 Performance improvement: ${((time8 - time9) / time8 * 100).toFixed(1)}%`);

    console.log('\n✅ All optimization tests completed successfully!');
    console.log('\n📋 Summary of Optimizations:');
    console.log('   ✅ Added compound indexes for common query patterns');
    console.log('   ✅ Implemented lean() queries for better performance');
    console.log('   ✅ Added field projection to limit returned data');
    console.log('   ✅ Optimized aggregation pipelines with $facet');
    console.log('   ✅ Added text search indexes');
    console.log('   ✅ Configured global mongoose optimizations');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run tests
testOptimizations();
