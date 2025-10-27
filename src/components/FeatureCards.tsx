import React from 'react'

interface FeatureCardProps {
  title: string
  description: string
  icon: string
  href?: string
  onClick?: () => void
  delay?: number
  featured?: boolean
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  title, 
  description, 
  icon, 
  href, 
  onClick, 
  delay = 0,
  featured = false 
}) => {
  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <div 
      className={`card hover-lift animate-fade-in-up ${featured ? 'animate-glow' : ''}`}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        animationDelay: `${delay}s`,
        background: featured 
          ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(184, 134, 11, 0.1) 100%)'
          : 'rgba(255, 255, 255, 0.05)',
        border: featured 
          ? '1px solid rgba(212, 175, 55, 0.3)'
          : '1px solid rgba(255, 255, 255, 0.1)'
      }}
      onClick={handleClick}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '32px',
          background: featured 
            ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
            : 'rgba(255, 255, 255, 0.1)',
          padding: '12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '56px',
          height: '56px'
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="heading-md" style={{ marginBottom: '8px' }}>
            {title}
          </h3>
          <p className="text-muted" style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {description}
          </p>
        </div>
      </div>
      
      {href && (
        <div style={{ marginTop: '16px' }}>
          <span style={{
            color: '#D4AF37',
            fontSize: '14px',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Learn more →
          </span>
        </div>
      )}
    </div>
  )
}

interface FeaturesGridProps {
  onNavigate: (path: string) => void
  connected: boolean
}

export const FeaturesGrid: React.FC<FeaturesGridProps> = ({ onNavigate, connected }) => {
  const features = [
    {
      title: 'Create Events',
      description: 'Launch your event and automatically generate NFT collections using Hedera Token Service. Set pricing, limits, and metadata.',
      icon: '🎪',
      onClick: () => onNavigate('/create'),
      featured: !connected
    },
    {
      title: 'Mint NFT Tickets',
      description: 'Purchase tickets as unique NFTs with verifiable ownership. Each ticket contains event metadata and proof of purchase.',
      icon: '🎫',
      onClick: () => onNavigate('/event/1')
    },
    {
      title: 'Secure & Transparent',
      description: 'Built on Hedera Hashgraph for fast, secure, and environmentally sustainable transactions with minimal fees.',
      icon: '🔒'
    },
    {
      title: 'Trade & Transfer',
      description: 'NFT tickets are fully transferable and can be traded on secondary markets. Smart contracts ensure authenticity.',
      icon: '🔄'
    },
    {
      title: 'Event Analytics',
      description: 'Track sales, attendee data, and revenue in real-time. Export data and integrate with existing event management tools.',
      icon: '📊'
    },
    {
      title: 'Mobile Ready',
      description: 'Scan QR codes at events for instant verification. Works with all major mobile wallets and supports offline validation.',
      icon: '📱'
    }
  ]

  return (
    <section style={{ padding: '60px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 className="heading-lg animate-fade-in-up">
            Everything you need for Web3 events
          </h2>
          <p className="text-muted animate-fade-in-up" style={{ 
            fontSize: '16px', 
            animationDelay: '0.1s',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            From creation to verification, our platform handles every aspect of decentralized event ticketing
          </p>
        </div>

        <div className="grid grid-3">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              onClick={feature.onClick}
              delay={index * 0.1}
              featured={feature.featured}
            />
          ))}
        </div>
      </div>
    </section>
  )
}