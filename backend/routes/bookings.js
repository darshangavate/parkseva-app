const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

// POST /api/bookings  { spotId, date, startTime, endTime }
router.post('/', requireAuth, async (req, res) => {
  try {
    const { spotId, date, startTime, endTime } = req.body;
    if (!spotId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'spotId, date, startTime, endTime are required' });
    }

    const spot = await ParkingSpot.findById(spotId).lean();
    if (!spot || !spot.isActive) {
      return res.status(404).json({ success: false, message: 'Parking spot not found' });
    }

    // check overlapping bookings count compared to capacity
    const overlapCount = await Booking.countDocuments({
      spot: spot._id,
      date,
      $expr: { $and: [{ $lt: ['$startTime', endTime] }, { $gt: ['$endTime', startTime] }] }
    });

    if (overlapCount >= (spot.capacity || 1)) {
      return res.status(409).json({ success: false, message: 'Spot not available for the given time range' });
    }

    // price estimate (very naive): hours * pricePerHour
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const hours = Math.max(1, Math.ceil(((eh * 60 + em) - (sh * 60 + sm)) / 60));
    const price = hours * (spot.pricePerHour || 0);

    const booking = await Booking.create({
      user: req.userId,
      spot: spot._id,
      date,
      startTime,
      endTime,
      price,
      status: 'confirmed'
    });

    return res.status(201).json({ success: true, data: { bookingId: booking._id } });
  } catch (err) {
    console.error('Create booking error:', err);
    // handle duplicate key (unique index) gracefully
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, message: 'A similar booking already exists' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create booking' });
  }
});

// GET /api/bookings/my
router.get('/my', requireAuth, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(24, parseInt(req.query.limit || '8', 10)));

    const [rows, total] = await Promise.all([
      Booking.find({ user: req.userId })
        .populate({ path: 'spot', select: 'title address pricePerHour' })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Booking.countDocuments({ user: req.userId })
    ]);

    return res.json({
      success: true,
      data: {
        bookings: rows.map(b => ({
          _id: b._id,
          spot: b.spot,
          status: b.status,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          price: b.price,
          notes: b.notes
        })),
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total
      }
    });
  } catch (err) {
    console.error('My bookings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load bookings' });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const b = await Booking.findOne({ _id: req.params.id, user: req.userId });
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });

    // allow cancel for future bookings in pending/confirmed/active
    const futureStatuses = ['pending', 'confirmed', 'active'];
    if (!futureStatuses.includes((b.status || '').toLowerCase())) {
      return res.status(400).json({ success: false, message: 'This booking cannot be cancelled' });
    }
    b.status = 'cancelled';
    await b.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('Cancel booking error:', err);
    return res.status(500).json({ success: false, message: 'Failed to cancel booking' });
  }
});

module.exports = router;
