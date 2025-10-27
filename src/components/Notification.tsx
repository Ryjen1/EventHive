import React from 'react'

interface NotificationProps {
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  onClose?: () => void
}

export const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const colors = {
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' },
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: '#10b981' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', text: '#f59e0b' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' }
  }

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  }

  return (
    <div 
      className="animate-fade-in-up"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '16px 20px',
        background: colors[type].bg,
        border: `1px solid ${colors[type].border}`,
        borderRadius: '12px',
        color: colors[type].text,
        fontSize: '14px',
        maxWidth: '400px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
      }}
    >
      <span style={{ fontSize: '16px' }}>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: colors[type].text,
            cursor: 'pointer',
            padding: '4px',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}