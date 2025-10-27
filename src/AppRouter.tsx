import React from 'react'
import { Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDAppConnector } from './services/wallets/ClientProviders'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { FeaturesGrid } from './components/FeatureCards'
import { WalletButton } from './components/WalletButton'
import { eventService, EventData } from './services/hedera/eventService'

function Home() {
  const navigate = useNavigate()
  const { isConnected } = useDAppConnector()
  const [events, setEvents] = React.useState<EventData[]>(() => eventService.getEvents())

  React.useEffect(() => {
    const unsubscribe = eventService.subscribe((nextEvents) => {
      setEvents(nextEvents)
    })
    return unsubscribe
  }, [])

  return (
    <div className="animate-fade-in">
      <HeroSection onNavigate={navigate} connected={isConnected} firstEventId={events[0]?.id} />
      <FeaturesGrid onNavigate={navigate} connected={isConnected} />

      <section
        id="events-section"
        style={{
          padding: '60px 24px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <h2 className="heading-lg" style={{ marginBottom: '12px' }}>Live events on Hedera</h2>
              <p className="text-muted" style={{ maxWidth: '600px' }}>
                Every event listed here is backed by on-chain metadata and an NFT ticket collection. Connect your wallet to mint your own experience.
              </p>
            </div>
            <button
              className="btn btn-secondary hover-lift"
              onClick={() => navigate('/create')}
              style={{ whiteSpace: 'nowrap' }}
            >
              ➕ Create new event
            </button>
          </div>

          {events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px 32px' }}>
              <div style={{ fontSize: '42px', marginBottom: '16px' }}>🎟️</div>
              <h3 className="heading-md" style={{ marginBottom: '12px' }}>No events yet</h3>
              <p className="text-muted" style={{ marginBottom: '24px' }}>
                Be the first to deploy an event on Hedera and have it show up here instantly after the transaction is confirmed.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/create')}>
                Launch your event
              </button>
            </div>
          ) : (
            <div className="grid" style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {events.map((event) => {
                const eventDate = new Date(event.date)
                const formattedDate = isNaN(eventDate.getTime())
                  ? event.date
                  : eventDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                const sold = event.ticketsSold ?? 0
                const remaining = Math.max(event.maxTickets - sold, 0)
                const availability = Math.round((sold / event.maxTickets) * 100)
                return (
                  <div
                    key={event.id}
                    className="card hover-lift animate-fade-in-up"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '12px', letterSpacing: '0.6px', color: '#60a5fa', textTransform: 'uppercase' }}>
                        On-chain ticketing
                      </span>
                      <h3 className="heading-md" style={{ margin: 0 }}>{event.name}</h3>
                      <p className="text-muted" style={{ fontSize: '14px', minHeight: '40px' }}>
                        {event.description.length > 120 ? `${event.description.slice(0, 117)}...` : event.description}
                      </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Date</span>
                        <span>{formattedDate}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="text-muted">Ticket price</span>
                        <span>{event.ticketPrice} HBAR</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="text-muted">Availability</span>
                        <span>{remaining} / {event.maxTickets}</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min(availability, 100)}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #D4AF37 0%, #B8860B 100%)'
                        }}></div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        View event
                      </button>
                      <div className="text-muted" style={{ fontSize: '12px' }}>
                        Token ID: {event.tokenId ?? 'Pending'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ 
        padding: '60px 24px', 
        background: 'rgba(255, 255, 255, 0.02)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 className="heading-lg animate-fade-in-up" style={{ marginBottom: '40px' }}>
            Trusted by creators worldwide
          </h2>
          
          <div className="grid grid-3" style={{ gap: '32px' }}>
            {[
              { number: '1,000+', label: 'Events Created', icon: '🎪' },
              { number: '50K+', label: 'Tickets Sold', icon: '🎫' },
              { number: '99.9%', label: 'Uptime', icon: '🔒' }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>{stat.icon}</div>
                <div className="heading-lg" style={{ 
                  background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {stat.number}
                </div>
                <div className="text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function CreateEvent() {
  const { dAppConnector, userAccountId, isConnected } = useDAppConnector()
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    date: '',
    price: '',
    maxTickets: ''
  })
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected || !dAppConnector || !userAccountId) {
      alert('Please connect your Hedera wallet first')
      return
    }
    
    if (!formData.name || !formData.description || !formData.date || !formData.price || !formData.maxTickets) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsCreating(true)
    
    try {
      const eventData = {
        id: Date.now().toString(), // Generate unique ID
        name: formData.name,
        description: formData.description,
        date: formData.date,
        ticketPrice: parseFloat(formData.price),
        maxTickets: parseInt(formData.maxTickets)
      }
      
      console.log('Creating event with HashPack signing...')
      
      // Create event with Hedera wallet signing
      const createdEvent = await eventService.createEvent(eventData, dAppConnector, userAccountId)
      
      alert(`🎉 Event "${createdEvent.name}" created successfully!\n\nNFT Collection: ${createdEvent.tokenId}\nMetadata File: ${createdEvent.metadataFileId}`)
      navigate(`/event/${createdEvent.id}`)
      
    } catch (error) {
      console.error('Event creation failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Event creation failed:\n\n${errorMessage}`)
    } finally {
      setIsCreating(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  if (!isConnected) {
    return (
      <div className="animate-fade-in" style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div className="card" style={{ 
          maxWidth: '500px', 
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 className="heading-md">Hedera Wallet Required</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            Connect your Hedera wallet to create events and sign transactions on the network
          </p>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="https://www.hashpack.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              📱 Download HashPack
            </a>
            <WalletButton />
          </div>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Supports HashPack, Blade, and other Hedera-compatible wallets
          </p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="animate-fade-in" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="heading-lg animate-fade-in-up">🎭 Create New Event</h1>
          <p className="text-muted animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Launch your event and automatically generate an NFT collection on Hedera
          </p>
        </div>

        <div className="grid grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Form */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="heading-md" style={{ marginBottom: '24px' }}>Event Details</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '500' }}>
                  Event Name *
                </label>
                <input 
                  className="form-input"
                  placeholder="Web3 Conference 2025"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '500' }}>
                  Description *
                </label>
                <textarea 
                  className="form-input"
                  placeholder="Join us for the biggest Web3 event of the year..."
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '500' }}>
                    Event Date *
                  </label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '500' }}>
                    Ticket Price (HBAR) *
                  </label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="form-input"
                    placeholder="50.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#e2e8f0', fontWeight: '500' }}>
                  Maximum Tickets *
                </label>
                <input 
                  type="number" 
                  className="form-input"
                  placeholder="500"
                  value={formData.maxTickets}
                  onChange={(e) => handleInputChange('maxTickets', e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isCreating}
                className="btn btn-primary"
                style={{ 
                  padding: '16px',
                  fontSize: '16px',
                  marginTop: '8px',
                  background: isCreating ? 'rgba(59, 130, 246, 0.5)' : undefined
                }}
              >
                {isCreating && <div className="spinner"></div>}
                {isCreating ? 'Creating Event...' : '🚀 Create Event & NFT Collection'}
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="heading-md" style={{ marginBottom: '24px' }}>Preview</h3>
            <div style={{ 
              padding: '20px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                {formData.name || 'Your Event Name'}
              </h4>
              <p className="text-muted" style={{ fontSize: '14px', marginBottom: '16px' }}>
                {formData.description || 'Your event description will appear here...'}
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Date:</span>
                  <span>{formData.date || 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Price:</span>
                  <span>{formData.price ? `${formData.price} HBAR` : 'Not set'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="text-muted">Tickets:</span>
                  <span>{formData.maxTickets || '0'} available</span>
                </div>
              </div>

              <div style={{ 
                marginTop: '16px', 
                padding: '12px', 
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#D4AF37'
              }}>
                💡 Your NFT collection will be created on Hedera Token Service
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EventDetail() {
  const { dAppConnector, userAccountId, isConnected } = useDAppConnector()
  const navigate = useNavigate()
  const [isMinting, setIsMinting] = React.useState(false)
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = React.useState<EventData | null>(() => (id ? eventService.getEventById(id) ?? null : null))

  React.useEffect(() => {
    if (!id) return

    setEvent(eventService.getEventById(id) ?? null)

    const unsubscribe = eventService.subscribe((nextEvents) => {
      const updated = nextEvents.find((e) => e.id === id) ?? null
      setEvent(updated)
    })

    return unsubscribe
  }, [id])

  if (!id) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px 24px' }}>
        <div className="card" style={{ maxWidth: '640px', margin: '80px auto', textAlign: 'center' }}>
          <h2 className="heading-md" style={{ marginBottom: '12px' }}>Event not found</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            The requested event ID is missing. Try browsing the live events instead.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Browse events</button>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>Create an event</button>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="animate-fade-in" style={{ padding: '40px 24px' }}>
        <div className="card" style={{ maxWidth: '640px', margin: '80px auto', textAlign: 'center' }}>
          <h2 className="heading-md" style={{ marginBottom: '12px' }}>Event loading</h2>
          <p className="text-muted" style={{ marginBottom: '24px' }}>
            We could not find this event locally. It might be loading or has not been created yet.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to home</button>
            <button className="btn btn-primary" onClick={() => navigate('/create')}>Create event</button>
          </div>
        </div>
      </div>
    )
  }

  const handleMintTicket = async () => {
    if (!isConnected || !dAppConnector || !userAccountId) {
      alert('Please connect your Hedera wallet first')
      return
    }

    setIsMinting(true)

    try {
      console.log('Purchasing ticket with HashPack signing...')
      
      // Purchase ticket with Hedera wallet signing (using mock event ID)
      const serialNumber = await eventService.purchaseTicket(event.id, dAppConnector, userAccountId)
      
      alert(`🎉 Ticket NFT minted successfully!\n\nSerial Number: ${serialNumber}\n\nYour ticket is now in your Hedera wallet!`)

    } catch (error) {
      console.error('Ticket purchase failed:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      alert(`❌ Ticket purchase failed:\n\n${errorMessage}`)
    } finally {
      setIsMinting(false)
    }
  }

  const sold = event.ticketsSold ?? 0
  const remaining = Math.max(event.maxTickets - sold, 0)
  const formattedDate = (() => {
    const parsed = new Date(event.date)
    if (isNaN(parsed.getTime())) return event.date
    return parsed.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  })()
  const image = event.coverImage ?? 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
  const organizer = event.creatorAccountId ?? 'Anonymous organizer'
  const tags = ['Hedera', 'NFT Tickets']
  
  return (
    <div className="animate-fade-in" style={{ padding: '40px 24px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Back button */}
        <button 
          onClick={() => navigate('/')}
          className="btn btn-secondary animate-slide-in"
          style={{ marginBottom: '24px', padding: '8px 16px' }}
        >
          ← Back to Events
        </button>

        <div className="grid grid-2" style={{ alignItems: 'flex-start', gap: '40px' }}>
          {/* Event Info */}
          <div className="animate-fade-in-up">
            <div style={{
              width: '100%',
              height: '300px',
              background: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '16px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '24px'
            }}>
              <div>
                <h1 className="heading-lg" style={{ color: 'white', marginBottom: '8px' }}>
                  {event.name}
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {tags.map(tag => (
                    <span key={tag} style={{
                      padding: '4px 12px',
                      background: 'rgba(212, 175, 55, 0.8)',
                      borderRadius: '16px',
                      fontSize: '12px',
                      color: 'white'
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="heading-md" style={{ marginBottom: '16px' }}>Event Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>
                      {formattedDate}
                    </div>
                    <div className="text-muted" style={{ fontSize: '14px' }}>Ticket price {event.ticketPrice} HBAR</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📍</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>Max supply: {event.maxTickets}</div>
                    <div className="text-muted" style={{ fontSize: '14px' }}>Remaining: {remaining}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>👤</span>
                  <div>
                    <div style={{ fontWeight: '500' }}>Organized by</div>
                    <div className="text-muted" style={{ fontSize: '14px' }}>{organizer}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '8px' }}>About this event</h4>
                <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Purchase */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="card" style={{
              position: 'sticky',
              top: '24px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎫</div>
                <h3 className="heading-md">Get Your NFT Ticket</h3>
                <p className="text-muted">Secure your spot with blockchain technology</p>
              </div>

              <div style={{ 
                background: 'rgba(255, 255, 255, 0.05)', 
                padding: '20px', 
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                  <span className="text-muted">Ticket Price</span>
                  <span style={{ fontSize: '18px', fontWeight: '600' }}>
                    {event.ticketPrice} HBAR
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span className="text-muted">Available</span>
                  <span>{remaining}/{event.maxTickets}</span>
                </div>

                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((sold / event.maxTickets) * 100, 100)}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>

              {isConnected ? (
                <button 
                  onClick={handleMintTicket}
                  disabled={isMinting}
                  className="btn btn-success hover-lift"
                  style={{ 
                    width: '100%', 
                    padding: '16px',
                    fontSize: '16px',
                    background: isMinting ? 'rgba(16, 185, 129, 0.5)' : undefined
                  }}
                >
                  {isMinting && <div className="spinner"></div>}
                  {isMinting ? 'Minting NFT...' : `🚀 Mint Ticket NFT (${event.ticketPrice} HBAR)`}
                </button>
              ) : (
                <div>
                  <div style={{ 
                    padding: '16px', 
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#ef4444', fontSize: '14px' }}>
                      Connect your wallet to purchase tickets
                    </p>
                  </div>
                  <div style={{ width: '100%' }}>
                    <WalletButton />
                  </div>
                </div>
              )}

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#D4AF37',
                textAlign: 'center'
              }}>
                💡 Your ticket will be minted as an NFT on Hedera
              </div>

              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', fontSize: '12px', color: '#94a3b8' }}>
                <div>Token ID: {event.tokenId ?? 'Pending creation'}</div>
                <div>Metadata file: {event.metadataFileId ?? 'Pending upload'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AppRouter() {
  const location = useLocation()
  const navigate = useNavigate()
  const { dAppConnector, userAccountId } = useDAppConnector()

  React.useEffect(() => {
    if (!dAppConnector || !userAccountId) {
      return
    }

    eventService
      .refreshFromContract(dAppConnector, userAccountId)
      .catch((error) => console.warn('⚠️ Failed to sync events from contract', error))
  }, [dAppConnector, userAccountId])
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentPath={location.pathname} onNavigate={navigate} />
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetail />} />
        </Routes>
      </main>
      
      {/* Footer */}
      <footer className="animate-fade-in" style={{ 
        padding: '40px 24px 20px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px' }}>🎟️</span>
            <span style={{ fontWeight: '600', fontSize: '18px' }}>EventHive</span>
          </div>
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Built with ❤️ on Hedera Hashgraph • Decentralized Event Ticketing
          </p>
          <p className="text-muted" style={{ fontSize: '12px', marginTop: '8px' }}>
            Powered by Reown • Secured by Web3
          </p>
        </div>
      </footer>
    </div>
  )
}
