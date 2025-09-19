const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    spot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot', required: true, index: true },

    date: { type: String, required: true },      // 'YYYY-MM-DD'
    startTime: { type: String, required: true }, // 'HH:mm'
    endTime: { type: String, required: true },   // 'HH:mm'

    price: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled'],
      default: 'confirmed'
    },
    notes: { type: String }
  },
  { timestamps: true }
);

// prevent naive duplicates quickly (same user, spot, date, times)
BookingSchema.index({ user: 1, spot: 1, date: 1, startTime: 1, endTime: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema);
