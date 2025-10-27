import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  IconButton,
  Stack,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Event as EventIcon } from '@mui/icons-material';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { eventService, TicketType } from '../services/eventService';
import BlockchainService from '../services/blockchainService';

interface FormData {
  name: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  image: string;
  organizer: string;
}

interface NewTicketType extends Omit<TicketType, 'id' | 'currentSupply'> {
  id?: string;
}

const CreateEventPage: React.FC = () => {
  const { accountId, walletInterface } = useWalletInterface();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    image: '',
    organizer: ''
  });

  const [ticketTypes, setTicketTypes] = useState<NewTicketType[]>([
    {
      name: 'General Admission',
      description: 'Standard access to the event',
      price: 50,
      maxSupply: 100
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (index: number, field: keyof NewTicketType, value: string | number) => {
    setTicketTypes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addTicketType = () => {
    setTicketTypes(prev => [...prev, {
      name: '',
      description: '',
      price: 0,
      maxSupply: 0
    }]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Event name is required';
    if (!formData.description.trim()) return 'Event description is required';
    if (!formData.date) return 'Event date is required';
    if (!formData.time) return 'Event time is required';
    if (!formData.venue.trim()) return 'Event venue is required';
    if (!formData.organizer.trim()) return 'Organizer name is required';
    
    const today = new Date().toISOString().split('T')[0];
    if (formData.date < today) return 'Event date cannot be in the past';

    for (let i = 0; i < ticketTypes.length; i++) {
      const ticket = ticketTypes[i];
      if (!ticket.name.trim()) return `Ticket type ${i + 1} name is required`;
      if (ticket.price <= 0) return `Ticket type ${i + 1} price must be greater than 0`;
      if (ticket.maxSupply <= 0) return `Ticket type ${i + 1} max supply must be greater than 0`;
    }

    return null;
  };

  const handleCreateEvent = async (deployNow: boolean = false) => {
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (deployNow && !accountId) {
      setError('Please connect your wallet to deploy to blockchain');
      return;
    }

    setLoading(true);

    try {
      // Prepare ticket types with IDs
      const processedTicketTypes: TicketType[] = ticketTypes.map((tt, index) => ({
        ...tt,
        id: tt.id || `ticket_type_${index}`,
        currentSupply: 0
      }));

      // Create event locally
      const event = eventService.createEvent({
        ...formData,
        organizer: formData.organizer,
        organizerAccountId: accountId || 'unknown',
        ticketTypes: processedTicketTypes
      });

      setSuccess(`Event "${event.name}" created successfully!`);

      // Deploy to blockchain if requested
      if (deployNow && walletInterface && accountId) {
        try {
          const blockchainService = BlockchainService.create(walletInterface, accountId);
          const result = await blockchainService.deployEventNFTCollection(event);
          
          if (result) {
            setSuccess(`Event created and deployed to blockchain! Token ID: ${result.tokenId.toString()}`);
          } else {
            // Check if user is using MetaMask (account starts with 0x)
            if (accountId.startsWith('0x')) {
              setError('MetaMask has limited support for Hedera Token Service. Please use WalletConnect for full blockchain deployment capabilities, or create the event locally for now.');
            } else {
              setError('Blockchain deployment failed. Please ensure your wallet supports Hedera Token Service operations.');
            }
          }
        } catch (deployError) {
          console.error('Blockchain deployment error:', deployError);
          setError('Event created locally, but blockchain deployment failed. Please check your wallet connection and try again.');
        }
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        image: '',
        organizer: ''
      });
      setTicketTypes([{
        name: 'General Admission',
        description: 'Standard access to the event',
        price: 50,
        maxSupply: 100
      }]);

    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <EventIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" color="primary">
            Create New Event
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Event Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Event Details
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Event Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Organizer"
              value={formData.organizer}
              onChange={(e) => handleInputChange('organizer', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Time"
              type="time"
              value={formData.time}
              onChange={(e) => handleInputChange('time', e.target.value)}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Venue"
              value={formData.venue}
              onChange={(e) => handleInputChange('venue', e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Image URL (optional)"
              value={formData.image}
              onChange={(e) => handleInputChange('image', e.target.value)}
              placeholder="https://example.com/event-image.jpg"
            />
          </Grid>

          {/* Ticket Types */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, mb: 2 }}>
              <Typography variant="h6">
                Ticket Types
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={addTicketType}
                variant="outlined"
                size="small"
              >
                Add Ticket Type
              </Button>
            </Box>
          </Grid>

          {ticketTypes.map((ticketType, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      Ticket Type {index + 1}
                    </Typography>
                    {ticketTypes.length > 1 && (
                      <IconButton
                        onClick={() => removeTicketType(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Ticket Name"
                        value={ticketType.name}
                        onChange={(e) => handleTicketTypeChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Price (HBAR)"
                        type="number"
                        value={ticketType.price}
                        onChange={(e) => handleTicketTypeChange(index, 'price', parseFloat(e.target.value) || 0)}
                        required
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Max Supply"
                        type="number"
                        value={ticketType.maxSupply}
                        onChange={(e) => handleTicketTypeChange(index, 'maxSupply', parseInt(e.target.value) || 0)}
                        required
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={ticketType.description}
                        onChange={(e) => handleTicketTypeChange(index, 'description', e.target.value)}
                        placeholder="Describe what's included with this ticket type"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Wallet Status */}
          <Grid item xs={12}>
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Wallet Status:
              </Typography>
              {accountId ? (
                <Box>
                  <Chip 
                    label={`Connected: ${accountId.substring(0, 15)}...`} 
                    color="success" 
                    size="small" 
                  />
                  {accountId.startsWith('0x') && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>MetaMask Limitation:</strong> MetaMask has limited support for Hedera Token Service operations. 
                        For full blockchain deployment (NFT collection creation), please use WalletConnect instead. 
                        You can still create events locally and deploy them later.
                      </Typography>
                    </Alert>
                  )}
                </Box>
              ) : (
                <Chip 
                  label="Not Connected - Connect wallet to deploy to blockchain" 
                  color="warning" 
                  size="small" 
                />
              )}
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => handleCreateEvent(false)}
                disabled={loading}
                size="large"
              >
                Create Event (Local Only)
              </Button>
              
              <Button
                variant="contained"
                onClick={() => handleCreateEvent(true)}
                disabled={loading || !accountId}
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Creating & Deploying...' : 
                 accountId?.startsWith('0x') ? 'Create & Try Deploy (Limited)' : 
                 'Create & Deploy to Blockchain'}
              </Button>
            </Stack>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Local creation stores the event in your browser. Blockchain deployment creates an NFT collection on Hedera.
              {accountId?.startsWith('0x') && (
                <><br />
                <strong>Note:</strong> MetaMask has limited blockchain deployment capabilities. Use WalletConnect for full functionality.</>
              )}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default CreateEventPage;