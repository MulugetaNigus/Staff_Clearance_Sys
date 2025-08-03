const { expect } = require('chai');
const mongoose = require('mongoose');
const { seedDatabase } = require('../comprehensive-seeder');
const User = require('../models/User');
const ClearanceForm = require('../models/ClearanceForm');
const ClearanceRequest = require('../models/ClearanceRequest');

describe('Database Seeding', () => {
  before(async () => {
    // Connect to a test database or ensure the main database is clean
    // For simplicity, we'll use the same URI as the seeder, but in a real app,
    // you'd use a separate test database.
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clearance_system_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear the database before each test run
    await User.deleteMany({});
    await ClearanceForm.deleteMany({});
    await ClearanceRequest.deleteMany({});
  });

  after(async () => {
    await mongoose.disconnect();
  });

  it('should seed the database with users, forms, and requests', async () => {
    // Run the seeder
    await seedDatabase();

    // Verify data counts
    const userCount = await User.countDocuments();
    const formCount = await ClearanceForm.countDocuments();
    const requestCount = await ClearanceRequest.countDocuments();

    expect(userCount).to.be.above(0); // Expect at least some users
    expect(formCount).to.be.above(0); // Expect at least some forms
    expect(requestCount).to.be.above(0); // Expect at least some requests

    // Optionally, check specific data properties if needed
    const sampleUser = await User.findOne({ email: 'admin@woldia.edu.et' });
    expect(sampleUser).to.exist;
    expect(sampleUser.role).to.equal('SystemAdmin');
  }).timeout(20000); // Increase timeout for seeding
});
