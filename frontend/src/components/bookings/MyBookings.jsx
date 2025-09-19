import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActions, Button, Chip,
  Alert, CircularProgress, Pagination, Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const statusColor = (s) => {
  switch ((s || '').toLowerCase()) {
    case 'confirmed':
    case 'active':
      return 'success';
    case 'cancelled':
      return 'default';
    case 'completed':
      return 'primary';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

export default function MyBookings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  const [items, setItems] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // cancel dialog
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(null);
  const [doing, setDoing] = useState(false);
  const [actErr, setActErr] = useState('');

  const fetchBookings = async () => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      setLoading(true);
      setErr('');
      const res = await axios.get(`${API_BASE}/api/bookings/my`, {
        headers: authHeaders,
        params: { page, limit: 8 },
      });
      const arr = res.data?.data?.bookings || res.data?.bookings || [];
      const pages = res.data?.data?.totalPages || res.data?.totalPages || 1;
      setItems(arr);
      setTotalPages(Math.max(1, pages));
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to load bookings.';
      if (e.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
        return;
      }
      setErr(msg);
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const askCancel = (b) => {
    setTarget(b);
    setActErr('');
    setOpen(true);
  };
  const close = () => setOpen(false);

  const confirmCancel = async () => {
    if (!target) return;
    try {
      setDoing(true);
      setActErr('');
      await axios.delete(`${API_BASE}/api/bookings/${target._id || target.id}`, {
        headers: authHeaders,
      });
      setOpen(false);
      await fetchBookings();
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        e.message ||
        'Failed to cancel booking.';
      setActErr(msg);
    } finally {
      setDoing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Bookings
      </Typography>

      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : items.length === 0 ? (
        <Alert severity="info">You have no bookings yet.</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {items.map((b) => {
              const start = b.startTime || b.start || b.from;
              const end = b.endTime || b.end || b.to;
              const when =
                (b.date && dayjs(b.date).format('YYYY-MM-DD')) ||
                b.when ||
                '';
              const spot = b.spot || b.parkingSpot || {};
              const canCancel =
                ['pending', 'confirmed', 'active'].includes(
                  String(b.status || '').toLowerCase()
                ) &&
                dayjs(`${when} ${start}`).isAfter(dayjs()); // future

              return (
                <Grid item xs={12} md={6} lg={4} key={b._id || b.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {spot.title || spot.name || 'Parking Spot'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {spot.address || '—'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip size="small" label={when ? `📅 ${when}` : '—'} />
                        <Chip size="small" label={start && end ? `⏰ ${start} → ${end}` : '—'} />
                        <Chip
                          size="small"
                          label={`₹${b.price ?? b.amount ?? 0}`}
                          color="primary"
                        />
                        <Chip
                          size="small"
                          label={b.status || '—'}
                          color={statusColor(b.status)}
                        />
                      </Box>
                      {b.notes && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {b.notes}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => window.print()} // placeholder: download receipt etc.
                      >
                        Receipt
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        disabled={!canCancel}
                        onClick={() => askCancel(b)}
                      >
                        Cancel
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
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

      <Dialog open={open} onClose={close} maxWidth="xs" fullWidth>
        <DialogTitle>Cancel booking?</DialogTitle>
        <DialogContent dividers>
          {actErr && <Alert severity="error">{actErr}</Alert>}
          <Typography variant="body2" sx={{ mt: 1 }}>
            Are you sure you want to cancel this booking? This can’t be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Close</Button>
          <Button onClick={confirmCancel} color="error" variant="contained" disabled={doing}>
            {doing ? 'Cancelling…' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
