/**
 * ErrorBoundary.jsx
 *
 * Class component required by React's error boundary API.
 * Wraps DashboardPage so unexpected render errors show a graceful fallback
 * instead of a blank screen.
 */

import { Component } from 'react';
import PropTypes from 'prop-types';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'An unexpected error occurred.' };
  }

  componentDidCatch(error, info) {
    // In a production app, send to an error reporting service here.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset() {
    this.setState({ hasError: false, message: '' });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Something went wrong</h2>
          <p className="error-boundary__message">{this.state.message}</p>
          <button className="btn btn--primary" onClick={this.handleReset}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
