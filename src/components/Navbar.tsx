import { WalletButton } from './WalletButton'

interface NavbarProps {
  currentPath: string
  onNavigate: (path: string) => void
}

export const Navbar = ({ currentPath, onNavigate }: NavbarProps) => {

  return (
    <nav className="nav animate-fade-in">
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '16px 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Logo */}
        <div 
          onClick={() => onNavigate('/')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            cursor: 'pointer',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img
            src="/eh.jpg"
            alt="EventHive Logo"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px'
            }}
          />
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            EventHive
          </h1>
        </div>

        {/* Navigation Links */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {[
            { path: '/', label: 'Home', icon: '🏠' },
            { path: '/create', label: 'Create Event', icon: '➕' },
            { path: '/event/1', label: 'Browse', icon: '🎭' }
          ].map((item, index) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className="btn btn-secondary animate-slide-in"
              style={{
                animationDelay: `${index * 0.1}s`,
                background: currentPath === item.path
                  ? 'linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
                color: currentPath === item.path ? 'white' : '#e2e8f0'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Wallet Connection */}
        <div className="animate-slide-in" style={{ animationDelay: '0.4s' }}>
          <WalletButton />
        </div>
      </div>
    </nav>
  )
}