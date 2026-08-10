import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily: 'system-ui, sans-serif',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid rgba(15,23,42,0.08)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 8px', fontSize: '20px' }}>Something went wrong</h2>
            <p style={{ margin: '0 0 16px', color: '#475569', fontSize: '14px', lineHeight: 1.5 }}>
              The application encountered an unexpected error. You can try refreshing the page.
            </p>
            {this.state.error && (
              <pre style={{
                background: '#f1f5f9',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '12px',
                overflow: 'auto',
                color: '#dc2626',
                border: '1px solid rgba(220,38,38,0.15)'
              }}>
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: '#0d9488',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
