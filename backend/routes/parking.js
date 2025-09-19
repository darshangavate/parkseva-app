const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const ParkingSpot = require('../models/ParkingSpot');
const Booking = require('../models/Booking');

// GET /api/parking/search
router.get('/search', requireAuth, async (req, res) => {
  try {
    const {
      query = '',
      date,             // 'YYYY-MM-DD' (optional but recommended)
      startTime,        // 'HH:mm'
      endTime,          // 'HH:mm'
      maxPrice,         // number (optional)
      onlyAvailable = 'true',
      sort = 'price_asc',
      page = 1,
      limit = 8
    } = req.query;

    const p = Math.max(1, parseInt(page, 10));
    const l = Math.max(1, Math.min(24, parseInt(limit, 10)));

    // base filter
    const filter = { isActive: true };
    if (query) {
      // use text search or regex fallback
      filter.$or = [
        { $text: { $search: query } },
        { title:   { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
        { city:    { $regex: query, $options: 'i' } },
        { landmark:{ $regex: query, $options: 'i' } },
      ];
    }
    if (maxPrice) filter.pricePerHour = { $lte: Number(maxPrice) };

    // sorting
    const sortMap = {
      price_asc:  { pricePerHour: 1, _id: 1 },
      price_desc: { pricePerHour: -1, _id: 1 },
      rating_desc:{ rating: -1, _id: 1 },
      distance_asc: { _id: 1 }, // you can replace with geo-sort later
    };
    const sortSpec = sortMap[sort] || sortMap.price_asc;

    // fetch spots page
    const [spots, total] = await Promise.all([
      ParkingSpot.find(filter).sort(sortSpec).skip((p - 1) * l).limit(l).lean(),
      ParkingSpot.countDocuments(filter)
    ]);

    // availability check (naive): if onlyAvailable=true and date/time provided,
    // mark spot.available=false if there is an overlapping booking >= capacity.
    let results = spots.map(s => ({ ...s, available: true }));
    if (onlyAvailable === 'true' && date && startTime && endTime) {
      const spotIds = spots.map(s => s._id);
      const overlaps = await Booking.aggregate([
        { $match: { spot: { $in: spotIds }, date } },
        {
          $match: {
            $expr: {
              $and: [
                { $lt: ['$startTime', endTime] }, // start < req.end
                { $gt: ['$endTime', startTime] }, // end   > req.start
              ]
            }
          }
        },
        { $group: { _id: '$spot', count: { $sum: 1 } } }
      ]);

      const bookingsBySpot = overlaps.reduce((acc, x) => {
        acc[String(x._id)] = x.count;
        return acc;
      }, {});

      results = results.map(s => {
        const used = bookingsBySpot[String(s._id)] || 0;
        const available = used < (s.capacity || 1);
        return { ...s, available };
      }).filter(s => s.available); // filter out unavailable if requested
    }

    return res.json({
      success: true,
      data: {
        results,
        totalPages: Math.max(1, Math.ceil(total / l)),
        total
      }
    });
  } catch (err) {
    console.error('Parking search error:', err);
    return res.status(500).json({ success: false, message: 'Failed to search parking spots' });
  }
});

module.exports = router;
