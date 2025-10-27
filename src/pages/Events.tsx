import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  LocalActivity as TicketIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Event, eventService } from '../services/eventService';

const EventsPage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load events
    loadEvents();
  }, []);

  useEffect(() => {
    // Filter events based on search query
    if (searchQuery.trim()) {
      const filtered = eventService.searchEvents(searchQuery);
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchQuery, events]);

  const loadEvents = () => {
    setLoading(true);
    try {
      // Create sample events if none exist
      const existingEvents = eventService.getAllEvents();
      if (existingEvents.length === 0) {
        eventService.createSampleEvents();
      }
      
      const allEvents = eventService.getAllEvents();
      setEvents(allEvents);
      setFilteredEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  const formatDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return {
      date: eventDate.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getMinPrice = (event: Event): number => {
    return Math.min(...event.ticketTypes.map(tt => tt.price));
  };

  const getAvailableTickets = (event: Event): number => {
    return event.ticketTypes.reduce((total, tt) => total + (tt.maxSupply - tt.currentSupply), 0);
  };

  const isEventSoldOut = (event: Event): boolean => {
    return event.ticketTypes.every(tt => tt.currentSupply >= tt.maxSupply);
  };

  const isEventUpcoming = (event: Event): boolean => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return eventDateTime > new Date();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6">Loading events...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* Header */}
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          Discover Events
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Secure blockchain-powered event tickets
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper elevation={2} sx={{ p: 2, mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search events by name, venue, or organizer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
            <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" color="primary">{events.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Events</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
            <TicketIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
            <Typography variant="h4" color="secondary">
              {events.reduce((total, event) => total + event.ticketTypes.reduce((sum, tt) => sum + tt.maxSupply, 0), 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Tickets</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper elevation={1} sx={{ p: 2, textAlign: 'center' }}>
            <CalendarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" color="success.main">
              {events.filter(isEventUpcoming).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Upcoming Events</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
          <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchQuery ? 'No events match your search' : 'No events available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new events'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredEvents.map((event) => {
            const dateTime = formatDate(event.date, event.time);
            const minPrice = getMinPrice(event);
            const availableTickets = getAvailableTickets(event);
            const soldOut = isEventSoldOut(event);
            const upcoming = isEventUpcoming(event);

            return (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <Card 
                  elevation={3}
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleEventClick(event.id)}
                >
                  {event.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={event.image}
                      alt={event.name}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  
                  <CardContent sx={{ flexGrow: 1, p: 2 }}>
                    {/* Event Status Badges */}
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {!upcoming && (
                          <Chip label="Past Event" size="small" color="default" />
                        )}
                        {soldOut && (
                          <Chip label="Sold Out" size="small" color="error" />
                        )}
                        {event.tokenId && (
                          <Chip label="On Blockchain" size="small" color="success" />
                        )}
                      </Stack>
                    </Box>

                    {/* Event Title */}
                    <Typography variant="h6" component="h3" gutterBottom sx={{ 
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {event.name}
                    </Typography>

                    {/* Event Details */}
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {dateTime.date} at {dateTime.time}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {event.venue}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {event.organizer}
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Pricing and Availability */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Box>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                          From {minPrice} HBAR
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {availableTickets} tickets available
                        </Typography>
                      </Box>
                      
                      <Button
                        variant="contained"
                        size="small"
                        disabled={soldOut || !upcoming}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event.id);
                        }}
                      >
                        {soldOut ? 'Sold Out' : !upcoming ? 'Past Event' : 'View Details'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Event CTA */}
      <Paper elevation={2} sx={{ p: 4, mt: 6, textAlign: 'center', background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <Typography variant="h5" color="white" gutterBottom>
          Have an Event to Host?
        </Typography>
        <Typography variant="body1" color="white" sx={{ mb: 2 }}>
          Create your own event and sell blockchain-powered tickets
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/create-event')}
          sx={{ 
            backgroundColor: 'white', 
            color: 'primary.main',
            '&:hover': { backgroundColor: 'grey.100' }
          }}
        >
          Create Event
        </Button>
      </Paper>
    </Container>
  );
};

export default EventsPage;