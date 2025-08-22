const mongoose = require('mongoose');
const ClearanceStep = require('../models/ClearanceStep');
require('dotenv').config();

async function fixRoleNames() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Update Department Head role names
    const deptResult = await ClearanceStep.updateMany(
      { reviewerRole: 'DepartmentHeadReviewer' },
      { reviewerRole: 'DepartmentReviewer' }
    );
    console.log(`Updated ${deptResult.modifiedCount} Department Head steps`);

    // Update College Head role names  
    const collegeResult = await ClearanceStep.updateMany(
      { reviewerRole: 'CollegeHeadReviewer' },
      { reviewerRole: 'CollegeReviewer' }
    );
    console.log(`Updated ${collegeResult.modifiedCount} College Head steps`);

    // Show updated steps
    const updatedSteps = await ClearanceStep.find({
      reviewerRole: { $in: ['DepartmentReviewer', 'CollegeReviewer'] }
    }).select('reviewerRole department order');
    
    console.log('\nUpdated steps:');
    updatedSteps.forEach(step => {
      console.log(`- Role: ${step.reviewerRole}, Dept: ${step.department}, Order: ${step.order}`);
    });

    console.log('\nRole names fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing role names:', error);
    process.exit(1);
  }
}

fixRoleNames();
