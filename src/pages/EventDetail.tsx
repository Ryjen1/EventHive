import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  LocalActivity as TicketIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { AccountId } from '@hashgraph/sdk';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { Event, TicketType, eventService } from '../services/eventService';
import BlockchainService from '../services/blockchainService';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { accountId, walletInterface } = useWalletInterface();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [associating, setAssociating] = useState(false);

  useEffect(() => {
    if (eventId) {
      const foundEvent = eventService.getEvent(eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      } else {
        setError('Event not found');
      }
    }
  }, [eventId]);

  const formatDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return {
      fullDate: eventDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: eventDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const isEventUpcoming = (event: Event): boolean => {
    const eventDateTime = new Date(`${event.date}T${event.time}`);
    return eventDateTime > new Date();
  };

  const isTicketAvailable = (ticketType: TicketType): boolean => {
    return ticketType.currentSupply < ticketType.maxSupply;
  };

  const handleTicketPurchase = (ticketType: TicketType) => {
    if (!accountId) {
      setError('Please connect your wallet to purchase tickets');
      return;
    }

    if (!isTicketAvailable(ticketType)) {
      setError('This ticket type is sold out');
      return;
    }

    setSelectedTicketType(ticketType);
    setPurchaseDialogOpen(true);
    setError(null);
  };

  const handleAssociateToken = async () => {
    if (!event?.tokenId || !walletInterface) return;

    setAssociating(true);
    try {
      const blockchainService = BlockchainService.create(walletInterface, accountId!);
      const result = await blockchainService.associateToken(event.tokenId);
      
      if (result.success) {
        setSuccess('Token associated successfully! You can now purchase tickets.');
      } else {
        setError('Failed to associate token. Please try again.');
      }
    } catch (error) {
      console.error('Token association error:', error);
      setError('Failed to associate token. Please try again.');
    } finally {
      setAssociating(false);
    }
  };

  const confirmPurchase = async () => {
    if (!event || !selectedTicketType || !accountId || !walletInterface) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blockchainService = BlockchainService.create(walletInterface, accountId);
      const result = await blockchainService.purchaseTicket(
        event.id,
        selectedTicketType.id,
        AccountId.fromString(accountId)
      );

      if (result.success) {
        setSuccess(`Ticket purchased successfully! Transaction ID: ${result.transactionId}`);
        setPurchaseDialogOpen(false);
        
        // Refresh event data
        const updatedEvent = eventService.getEvent(event.id);
        if (updatedEvent) {
          setEvent(updatedEvent);
        }
      } else {
        setError('Failed to purchase ticket. Please try again.');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to purchase ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Typography variant="h6">{error || 'Loading event...'}</Typography>
        </Box>
      </Container>
    );
  }

  const dateTime = formatDate(event.date, event.time);
  const upcoming = isEventUpcoming(event);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Button onClick={() => navigate('/events')} sx={{ mb: 2 }}>
          ← Back to Events
        </Button>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* Event Image */}
          {event.image && (
            <Grid item xs={12}>
              <Paper elevation={3}>
                <img
                  src={event.image}
                  alt={event.name}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px'
                  }}
                />
              </Paper>
            </Grid>
          )}

          {/* Event Details */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {!upcoming && <Chip label="Past Event" color="default" />}
                  {event.tokenId && <Chip label="Blockchain Event" color="success" />}
                </Stack>
                
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                  {event.name}
                </Typography>
                
                <Typography variant="h6" color="text.secondary" paragraph>
                  {event.description}
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Event Information */}
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Date & Time
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dateTime.fullDate}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dateTime.time}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Venue
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.venue}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Organizer
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.organizer}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {event.tokenId && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <TicketIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Token ID
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {event.tokenId.toString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          </Grid>

          {/* Purchase Panel */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h5" gutterBottom color="primary">
                Get Tickets
              </Typography>

              {/* Wallet Connection Status */}
              <Box sx={{ mb: 3, p: 2, backgroundColor: accountId ? 'success.light' : 'warning.light', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WalletIcon sx={{ mr: 1 }} />
                  <Typography variant="subtitle2">
                    {accountId ? 'Wallet Connected' : 'Connect Wallet Required'}
                  </Typography>
                </Box>
                {accountId && (
                  <Typography variant="caption" color="text.secondary">
                    {accountId.substring(0, 15)}...
                  </Typography>
                )}
              </Box>

              {/* Token Association (if needed) */}
              {accountId && event.tokenId && (
                <Box sx={{ mb: 3 }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleAssociateToken}
                    disabled={associating}
                    startIcon={associating ? <CircularProgress size={20} /> : <CheckIcon />}
                  >
                    {associating ? 'Associating...' : 'Associate Token'}
                  </Button>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Required before purchasing blockchain tickets
                  </Typography>
                </Box>
              )}

              {/* Ticket Types */}
              <Stack spacing={2}>
                {event.ticketTypes.map((ticketType) => {
                  const available = isTicketAvailable(ticketType);
                  const remaining = ticketType.maxSupply - ticketType.currentSupply;

                  return (
                    <Card 
                      key={ticketType.id} 
                      variant="outlined"
                      sx={{ 
                        border: available ? '2px solid' : '1px solid',
                        borderColor: available ? 'primary.main' : 'grey.300',
                        opacity: available ? 1 : 0.6
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                          <Typography variant="h6" color="primary">
                            {ticketType.name}
                          </Typography>
                          <Typography variant="h6" fontWeight="bold">
                            {ticketType.price} HBAR
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {ticketType.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="text.secondary">
                            {remaining} of {ticketType.maxSupply} available
                          </Typography>
                          
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!available || !upcoming || !accountId}
                            onClick={() => handleTicketPurchase(ticketType)}
                          >
                            {!available ? 'Sold Out' : 
                             !upcoming ? 'Event Passed' : 
                             !accountId ? 'Connect Wallet' : 
                             'Buy Ticket'}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>

              {!upcoming && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  This event has already taken place. Tickets are no longer available for purchase.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onClose={() => !loading && setPurchaseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TicketIcon sx={{ mr: 2, color: 'primary.main' }} />
            Confirm Ticket Purchase
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedTicketType && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTicketType.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedTicketType.description}
              </Typography>
              
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Event:</Typography>
                    <Typography variant="body1" fontWeight="bold">{event.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Price:</Typography>
                    <Typography variant="h6" color="primary">{selectedTicketType.price} HBAR</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Date:</Typography>
                    <Typography variant="body1">{dateTime.fullDate}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Time:</Typography>
                    <Typography variant="body1">{dateTime.time}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="info" sx={{ mt: 2 }}>
                This will mint an NFT ticket to your wallet. The transaction will be recorded on the Hedera blockchain.
              </Alert>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setPurchaseDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={confirmPurchase}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <TicketIcon />}
          >
            {loading ? 'Processing...' : `Purchase for ${selectedTicketType?.price} HBAR`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetailPage;