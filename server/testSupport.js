require('dotenv').config();
const mongoose = require('mongoose');
const SupportTicket = require('./models/SupportTicket');
const User = require('./models/User');

const testSupport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autotradeai');
    console.log('Connected to DB');

    const admin = await User.findOne({ email: 'admin@autotradeai.com' });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    const ticket = new SupportTicket({
      userId: admin._id,
      subject: 'Test Subject',
      messages: [{ sender: 'user', content: 'Test message' }]
    });

    await ticket.save();
    console.log('Ticket saved successfully:', ticket._id);
    process.exit(0);
  } catch (err) {
    console.error('Error saving ticket:', err);
    process.exit(1);
  }
};

testSupport();
