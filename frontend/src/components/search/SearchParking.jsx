import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, TextField, Grid, Card, CardContent, CardActions, Button, Typography,
  Chip, Slider, Switch, FormControlLabel, MenuItem, Pagination, Dialog,
  DialogTitle, DialogContent, DialogActions, Alert, CircularProgress
} from '@mui/material';
import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function useDebounced(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function SearchParking() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounced(query);
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [maxPrice, setMaxPrice] = useState(200);
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sort, setSort] = useState('price_asc');
  const [page, setPage] = useState(1);

  const [results, setResults] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Booking dialog
  const [open, setOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingErr, setBookingErr] = useState('');
  const [bookingOk, setBookingOk] = useState('');

  const handleFetch = async () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      setLoading(true);
      setErr('');
      const res = await axios.get(`${API_BASE}/api/parking/search`, {
        headers: authHeaders,
        params: {
          query: debouncedQuery,
          date,
          startTime,
          endTime,
          maxPrice,
          onlyAvailable,
          sort,
          page,
          limit: 8,
        },
      });
      const items = res.data?.data?.results || res.data?.results || [];
      const pages = res.data?.data?.totalPages || res.data?.totalPages || 1;
      setResults(items);
      setTotalPages(Math.max(1, pages));
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to load parking spots.';
      if (e.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
      setErr(msg);
      setResults([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Fetch whenever filters change (debounced query)
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, date, startTime, endTime, maxPrice, onlyAvailable, sort]);

  useEffect(() => {
    handleFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, date, startTime, endTime, maxPrice, onlyAvailable, sort, page]);

  const openBooking = (spot) => {
    setSelectedSpot(spot);
    setBookingOk('');
    setBookingErr('');
    setOpen(true);
  };

  const closeBooking = () => setOpen(false);

  const confirmBooking = async () => {
    if (!selectedSpot) return;
    try {
      setBookingLoading(true);
      setBookingErr('');
      setBookingOk('');
      await axios.post(
        `${API_BASE}/api/bookings`,
        {
          spotId: selectedSpot._id || selectedSpot.id,
          date,
          startTime,
          endTime,
        },
        { headers: { ...authHeaders, 'Content-Type': 'application/json' } }
      );
      setBookingOk('Booking confirmed!');
      // Optionally refetch availability
      await handleFetch();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Booking failed.';
      setBookingErr(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Find Parking
      </Typography>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Search by area, landmark, city"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Andheri, Church Street, Connaught Place"
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            label="Start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            fullWidth
            label="End"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={6} md={2}>
          <TextField
            select
            fullWidth
            label="Sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <MenuItem value="price_asc">Price: Low → High</MenuItem>
            <MenuItem value="price_desc">Price: High → Low</MenuItem>
            <MenuItem value="distance_asc">Distance: Near → Far</MenuItem>
            <MenuItem value="rating_desc">Rating: High → Low</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="caption" color="text.secondary">
            Max Price (₹/hour)
          </Typography>
          <Slider
            value={maxPrice}
            min={0}
            max={1000}
            step={10}
            onChange={(_, v) => setMaxPrice(v)}
            valueLabelDisplay="auto"
          />
        </Grid>

        <Grid item xs={12} md="auto">
          <FormControlLabel
            control={
              <Switch
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
            }
            label="Only show available"
          />
        </Grid>
      </Grid>

      {/* Results */}
      {err && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {err}
        </Alert>
      )}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : results.length === 0 ? (
        <Alert severity="info">No parking spots found. Try changing filters.</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {results.map((spot) => (
              <Grid item xs={12} md={6} lg={4} key={spot._id || spot.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {spot.title || spot.name || 'Parking Spot'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {spot.address || spot.location?.address || '—'}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                      <Chip
                        size="small"
                        label={`₹${spot.pricePerHour ?? spot.price ?? 0}/hr`}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={spot.available ? 'Available' : 'Unavailable'}
                        color={spot.available ? 'success' : 'default'}
                      />
                      {typeof spot.distanceKm === 'number' && (
                        <Chip size="small" label={`${spot.distanceKm.toFixed(1)} km`} />
                      )}
                      {spot.rating && (
                        <Chip size="small" label={`⭐ ${spot.rating.toFixed(1)}`} />
                      )}
                    </Box>

                    {spot.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {spot.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Capacity: {spot.capacity ?? spot.slots ?? '—'}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!spot.available}
                      onClick={() => openBooking(spot)}
                    >
                      Book
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              color="primary"
              onChange={(_, p) => setPage(p)}
            />
          </Box>
        </>
      )}

      {/* Booking dialog */}
      <Dialog open={open} onClose={closeBooking} maxWidth="sm" fullWidth>
        <DialogTitle>Confirm Booking</DialogTitle>
        <DialogContent dividers>
          {selectedSpot && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                {selectedSpot.title || selectedSpot.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSpot.address || selectedSpot.location?.address || '—'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Date: {date} · {startTime} → {endTime}
              </Typography>
              <Typography variant="body2">
                Rate: ₹{selectedSpot.pricePerHour ?? selectedSpot.price ?? 0}/hr
              </Typography>
            </Box>
          )}
          {bookingErr && <Alert severity="error">{bookingErr}</Alert>}
          {bookingOk && <Alert severity="success">{bookingOk}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBooking}>Close</Button>
          <Button
            onClick={confirmBooking}
            variant="contained"
            disabled={bookingLoading}
          >
            {bookingLoading ? 'Booking…' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
