require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@autotradeai.com';
    const adminPassword = 'adminpassword123';

    let adminUser = await User.findOne({ email: adminEmail });
    if (adminUser) {
      console.log('Admin user already exists.');
      // Ensure role is admin
      adminUser.role = 'admin';
      await adminUser.save();
      console.log('Admin role ensured.');
    } else {
      adminUser = new User({
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        trialActive: false,
        subscription: { active: true, plan: 'Lifetime' }
      });
      await adminUser.save();
      console.log('Admin user created successfully.');
    }
    
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
