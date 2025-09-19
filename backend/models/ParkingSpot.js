const mongoose = require('mongoose');

const ParkingSpotSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, index: true },
    landmark: { type: String, trim: true },
    description: { type: String, trim: true },

    pricePerHour: { type: Number, required: true, min: 0 },
    capacity: { type: Number, default: 1, min: 1 },

    // quick flag; real systems would store availability per slot
    isActive: { type: Boolean, default: true },

    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    coords: {
      lat: Number,
      lng: Number,
    }
  },
  { timestamps: true }
);

// basic text search
ParkingSpotSchema.index({ title: 'text', address: 'text', city: 'text', landmark: 'text', description: 'text' });

module.exports = mongoose.model('ParkingSpot', ParkingSpotSchema);
