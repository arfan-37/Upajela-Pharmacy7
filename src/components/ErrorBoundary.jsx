import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and potentially external monitoring
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Send error to external error tracking if available
    if (window.gtag) {
      window.gtag('event', 'exception', {
        'description': error.toString(),
        'fatal': true
      });
    }
  }

  handleRetry = () => {
    // Reset error state and retry component rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-boundary-header">
              <h2>⚠️ Something went wrong</h2>
              <p>The application encountered an unexpected error. Please try again or refresh the page.</p>
            </div>

            <div className="error-boundary-body">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="error-details">
                  <h3>🐛 Error Details (Development Only):</h3>
                  <pre className="error-stack">
                    {this.state.error && this.state.error.toString()}
                  </pre>
                  <pre className="error-info">
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              <div className="error-actions">
                <button 
                  onClick={this.handleRetry}
                  className="btn btn-primary"
                >
                  🔄 Retry Application
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-secondary"
                >
                  🔃 Refresh Page
                </button>
              </div>
            </div>

            <div className="error-boundary-footer">
              <p>💡 If the problem persists, please contact support or refresh the application.</p>
            </div>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
