require('dotenv').config();
const mongoose = require('mongoose');
const ParkingSpot = require('../models/ParkingSpot');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const anyOwner = await User.findOne(); // pick any user as owner
    if (!anyOwner) throw new Error('Create a user first (register API)');

    const spots = [
      { owner: anyOwner._id, title: 'Basement Parking A', address: 'MG Road', city: 'Bengaluru', landmark: 'Metro Gate 2', pricePerHour: 60, capacity: 12, isActive: true },
      { owner: anyOwner._id, title: 'Covered Slot - B1', address: 'Andheri West', city: 'Mumbai', landmark: 'Infinity Mall', pricePerHour: 80, capacity: 5, isActive: true },
      { owner: anyOwner._id, title: 'Open Lot', address: 'Connaught Place', city: 'Delhi', landmark: 'Block A', pricePerHour: 40, capacity: 20, isActive: true },
    ];
    await ParkingSpot.insertMany(spots);
    console.log('✅ Seeded parking spots.');
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
