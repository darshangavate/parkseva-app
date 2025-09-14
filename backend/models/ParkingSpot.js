const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required']
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    }
  },
  pricing: {
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative']
    },
    dailyRate: {
      type: Number,
      min: [0, 'Daily rate cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR']
    }
  },
  availability: {
    isActive: {
      type: Boolean,
      default: true
    },
    availableFrom: {
      type: Date,
      required: [true, 'Available from date is required']
    },
    availableTo: {
      type: Date,
      required: [true, 'Available to date is required']
    },
    timeSlots: [{
      startTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      },
      endTime: {
        type: String,
        required: true,
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
      }
    }]
  },
  features: {
    vehicleTypes: [{
      type: String,
      enum: ['car', 'motorcycle', 'bicycle', 'truck', 'rv'],
      default: ['car']
    }],
    amenities: [{
      type: String,
      enum: ['covered', 'security', 'cctv', 'lighting', 'wheelchair_accessible', 'ev_charging']
    }],
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    size: {
      type: String,
      enum: ['compact', 'standard', 'large', 'extra_large'],
      default: 'standard'
    }
  },
  images: [{
    url: String,
    caption: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Create indexes for better search performance
parkingSpotSchema.index({ 'location.coordinates': '2dsphere' });
parkingSpotSchema.index({ 'location.city': 1 });
parkingSpotSchema.index({ 'pricing.hourlyRate': 1 });
parkingSpotSchema.index({ averageRating: -1 });
parkingSpotSchema.index({ createdAt: -1 });

// Update average rating when new review is added
parkingSpotSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = (totalRating / this.reviews.length).toFixed(1);
    this.totalReviews = this.reviews.length;
  }
};

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);