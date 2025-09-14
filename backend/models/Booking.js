const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  bookingDetails: {
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    duration: {
      hours: Number,
      minutes: Number
    },
    vehicleInfo: {
      type: {
        type: String,
        enum: ['car', 'motorcycle', 'bicycle', 'truck', 'rv'],
        required: true
      },
      licensePlate: {
        type: String,
        required: [true, 'License plate is required'],
        trim: true,
        uppercase: true
      },
      model: String,
      color: String
    }
  },
  payment: {
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Amount cannot be negative']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'active', 'completed', 'cancelled', 'no_show'],
    default: 'pending'
  },
  checkIn: {
    time: Date,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    verificationCode: String,
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  checkOut: {
    time: Date,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  },
  cancellation: {
    cancelledAt: Date,
    cancelledBy: {
      type: String,
      enum: ['user', 'owner', 'admin']
    },
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Validate that end time is after start time
bookingSchema.pre('save', function(next) {
  if (this.bookingDetails.endTime <= this.bookingDetails.startTime) {
    next(new Error('End time must be after start time'));
  } else {
    next();
  }
});

// Calculate duration before saving
bookingSchema.pre('save', function(next) {
  if (this.bookingDetails.startTime && this.bookingDetails.endTime) {
    const diffMs = this.bookingDetails.endTime - this.bookingDetails.startTime;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    this.bookingDetails.duration = {
      hours: diffHours,
      minutes: diffMinutes
    };
  }
  next();
});

// Create indexes
bookingSchema.index({ user: 1 });
bookingSchema.index({ parkingSpot: 1 });
bookingSchema.index({ 'bookingDetails.startTime': 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

// Compound index for checking availability
bookingSchema.index({ 
  parkingSpot: 1, 
  'bookingDetails.startTime': 1, 
  'bookingDetails.endTime': 1 
});

module.exports = mongoose.model('Booking', bookingSchema);