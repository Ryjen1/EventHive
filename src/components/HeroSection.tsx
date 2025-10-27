import React from 'react'

interface HeroSectionProps {
  onNavigate: (path: string) => void
  connected: boolean
  firstEventId?: string
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate, connected, firstEventId }) => {
  return (
    <section style={{
      padding: '80px 24px 60px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        animation: 'pulse 4s ease-in-out infinite'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        right: '15%',
        width: '150px',
        height: '150px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '50%',
        opacity: 0.1,
        animation: 'pulse 3s ease-in-out infinite reverse'
      }}></div>

      <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h1 className="heading-xl animate-fade-in-up" style={{ color: 'white' }}>
          EventHive
        </h1>
        
        <p className="animate-fade-in-up" style={{
          fontSize: '20px',
          color: 'white',
          marginBottom: '40px',
          lineHeight: '1.6',
          animationDelay: '0.2s'
        }}>
          Create events, mint NFT tickets, and build trust with blockchain technology.
          <br />
          Powered by <span className="text-gradient">Hedera Hashgraph</span>
        </p>

        <div className="animate-fade-in-up" style={{
          display: 'flex',
          gap: '16px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          animationDelay: '0.4s'
        }}>
          <button 
            onClick={() => onNavigate('/create')}
            className="btn btn-primary hover-lift"
            style={{ padding: '16px 32px', fontSize: '16px' }}
          >
            🚀 Create Event
          </button>
          <button
            onClick={() => {
              if (firstEventId) {
                onNavigate(`/event/${firstEventId}`)
              } else {
                const eventsSection = document.getElementById('events-section')
                if (eventsSection) {
                  eventsSection.scrollIntoView({ behavior: 'smooth' })
                } else {
                  onNavigate('/create')
                }
              }
            }}
            className="btn btn-secondary hover-lift"
            style={{ padding: '16px 32px', fontSize: '16px' }}
          >
            🎭 Browse Events
          </button>
        </div>

        {!connected && (
          <div className="animate-fade-in-up" style={{
            marginTop: '32px',
            padding: '16px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.2)',
            borderRadius: '12px',
            animationDelay: '0.6s'
          }}>
            <p style={{ color: 'white', fontSize: '14px' }}>
              💡 Connect your wallet to start creating events and minting NFT tickets
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
