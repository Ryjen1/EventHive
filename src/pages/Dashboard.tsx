import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  Stack,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  LocalActivity as TicketIcon,
  Event as EventIcon,
  QrCode as QrCodeIcon,
  Share as ShareIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccountBalanceWallet as WalletIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { Event, UserTicket, eventService } from '../services/eventService';
import BlockchainService from '../services/blockchainService';
import { AccountId } from '@hashgraph/sdk';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { accountId, walletInterface } = useWalletInterface();
  
  const [tabValue, setTabValue] = useState(0);
  const [userEvents, setUserEvents] = useState<Event[]>([]);
  const [userTickets, setUserTickets] = useState<UserTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<UserTicket | null>(null);
  const [ticketDialogOpen, setTicketDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (accountId) {
      loadUserData();
    }
  }, [accountId]);

  const loadUserData = () => {
    if (!accountId) return;

    // Load user's events
    const events = eventService.getEventsByOrganizer(accountId);
    setUserEvents(events);

    // Load user's tickets
    const tickets = eventService.getUserTickets(accountId);
    setUserTickets(tickets);
  };

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const formatDate = (date: string, time: string) => {
    const eventDate = new Date(`${date}T${time}`);
    return {
      date: eventDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
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

  const getEventStats = (event: Event) => {
    const totalTickets = event.ticketTypes.reduce((sum, tt) => sum + tt.maxSupply, 0);
    const soldTickets = event.ticketTypes.reduce((sum, tt) => sum + tt.currentSupply, 0);
    const revenue = event.ticketTypes.reduce((sum, tt) => sum + (tt.currentSupply * tt.price), 0);
    
    return { totalTickets, soldTickets, revenue };
  };

  const handleTicketClick = (ticket: UserTicket) => {
    setSelectedTicket(ticket);
    setTicketDialogOpen(true);
  };

  const handleTransferTicket = async () => {
    if (!selectedTicket || !accountId || !walletInterface || !transferAddress.trim()) {
      setError('Missing required information for transfer');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const blockchainService = BlockchainService.create(walletInterface, accountId);
      const result = await blockchainService.transferTicket(
        selectedTicket.tokenId,
        selectedTicket.serialNumber,
        AccountId.fromString(transferAddress.trim())
      );

      if (result.success) {
        setSuccess(`Ticket transferred successfully! Transaction ID: ${result.transactionId}`);
        setTransferDialogOpen(false);
        setTransferAddress('');
        loadUserData(); // Refresh data
      } else {
        setError('Failed to transfer ticket. Please try again.');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      setError('Failed to transfer ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!accountId) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, mt: 2, textAlign: 'center' }}>
          <WalletIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Connect Your Wallet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Please connect your wallet to view your dashboard with events and tickets.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')}>
            Go to Home Page
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DashboardIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" color="primary">
            My Dashboard
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" gutterBottom>
          Connected Wallet: {accountId}
        </Typography>

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

        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <EventIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary">{userEvents.length}</Typography>
              <Typography variant="body2" color="text.secondary">Events Created</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <TicketIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" color="secondary">{userTickets.length}</Typography>
              <Typography variant="body2" color="text.secondary">Tickets Owned</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
              <CalendarIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {userEvents.filter(isEventUpcoming).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Upcoming Events</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(event, newValue) => { void event; handleTabChange(newValue); }}>
              <Tab label={`My Events (${userEvents.length})`} />
              <Tab label={`My Tickets (${userTickets.length})`} />
            </Tabs>
          </Box>

          {/* My Events Tab */}
          <TabPanel value={tabValue} index={0}>
            {userEvents.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <EventIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Events Created Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Start by creating your first event
                </Typography>
                <Button variant="contained" onClick={() => navigate('/create-event')}>
                  Create Event
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {userEvents.map((event) => {
                  const stats = getEventStats(event);
                  const dateTime = formatDate(event.date, event.time);
                  const upcoming = isEventUpcoming(event);

                  return (
                    <Grid item xs={12} md={6} key={event.id}>
                      <Card elevation={2}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Typography variant="h6" color="primary" sx={{ flexGrow: 1 }}>
                              {event.name}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              {upcoming && <Chip label="Upcoming" color="success" size="small" />}
                              {event.tokenId && <Chip label="On Blockchain" color="primary" size="small" />}
                            </Stack>
                          </Box>

                          <Stack spacing={1} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {dateTime.date} at {dateTime.time}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {event.venue}
                              </Typography>
                            </Box>
                          </Stack>

                          <Divider sx={{ my: 2 }} />

                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">Sold</Typography>
                              <Typography variant="h6">{stats.soldTickets}/{stats.totalTickets}</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">Revenue</Typography>
                              <Typography variant="h6" color="success.main">{stats.revenue} HBAR</Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography variant="caption" color="text.secondary">Action</Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<ViewIcon />}
                                onClick={() => navigate(`/event/${event.id}`)}
                                fullWidth
                              >
                                View
                              </Button>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </TabPanel>

          {/* My Tickets Tab */}
          <TabPanel value={tabValue} index={1}>
            {userTickets.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TicketIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Tickets Purchased Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Browse events and purchase tickets to get started
                </Typography>
                <Button variant="contained" onClick={() => navigate('/events')}>
                  Browse Events
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {userTickets.map((ticket, index) => {
                  const dateTime = formatDate(ticket.event.date, ticket.event.time);
                  const upcoming = new Date(`${ticket.event.date}T${ticket.event.time}`) > new Date();

                  return (
                    <Grid item xs={12} md={6} key={index}>
                      <Card 
                        elevation={2} 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'translateY(-2px)' }
                        }}
                        onClick={() => handleTicketClick(ticket)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                            <Typography variant="h6" color="primary">
                              {ticket.event.name}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              {upcoming && <Chip label="Upcoming" color="success" size="small" />}
                              <Chip label={ticket.metadata.ticketType} color="secondary" size="small" />
                            </Stack>
                          </Box>

                          <Stack spacing={1} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {dateTime.date} at {dateTime.time}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {ticket.event.venue}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <TicketIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Seat: {ticket.metadata.seatNumber} | Serial: #{ticket.serialNumber}
                              </Typography>
                            </Box>
                          </Stack>

                          <Divider sx={{ my: 2 }} />

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" color="success.main">
                              {ticket.metadata.price} HBAR
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<QrCodeIcon />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTicketClick(ticket);
                              }}
                            >
                              View Ticket
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </TabPanel>
        </Paper>
      </Box>

      {/* Ticket Details Dialog */}
      <Dialog open={ticketDialogOpen} onClose={() => setTicketDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TicketIcon sx={{ mr: 2, color: 'primary.main' }} />
                Digital Ticket
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Paper sx={{ p: 3, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Typography variant="h5" color="white" gutterBottom>
                  {selectedTicket.event.name}
                </Typography>
                <Typography variant="h6" color="white" sx={{ opacity: 0.9 }}>
                  {selectedTicket.metadata.ticketType}
                </Typography>
                
                <Box sx={{ my: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 1 }}>
                  <Typography variant="body1" color="white">
                    Seat: {selectedTicket.metadata.seatNumber}
                  </Typography>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Serial #: {selectedTicket.serialNumber}
                  </Typography>
                </Box>

                <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                  QR Code: {selectedTicket.metadata.qrCode}
                </Typography>
              </Paper>

              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Event Date:</Typography>
                    <Typography variant="body1">
                      {formatDate(selectedTicket.event.date, selectedTicket.event.time).date}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Venue:</Typography>
                    <Typography variant="body1">{selectedTicket.event.venue}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Purchase Date:</Typography>
                    <Typography variant="body1">
                      {new Date(selectedTicket.metadata.purchaseDate).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Price Paid:</Typography>
                    <Typography variant="body1">{selectedTicket.metadata.price} HBAR</Typography>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={() => setTicketDialogOpen(false)}>
                Close
              </Button>
              <Button
                variant="outlined"
                startIcon={<ShareIcon />}
                onClick={() => {
                  setTicketDialogOpen(false);
                  setTransferDialogOpen(true);
                }}
              >
                Transfer Ticket
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Transfer Ticket Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => !loading && setTransferDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Ticket</DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Enter the Hedera account ID of the person you want to transfer this ticket to:
          </Typography>
          <TextField
            fullWidth
            label="Recipient Account ID"
            value={transferAddress}
            onChange={(e) => setTransferAddress(e.target.value)}
            placeholder="0.0.123456"
            disabled={loading}
          />
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. Make sure the recipient account ID is correct.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleTransferTicket}
            disabled={loading || !transferAddress.trim()}
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage;