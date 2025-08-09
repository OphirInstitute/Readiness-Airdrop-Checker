'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  Shield,
  Wifi,
  Server,
  Clock
} from 'lucide-react';

interface ProfessionalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface ErrorStateProps {
  type: 'bridge' | 'kaito' | 'api' | 'network' | 'timeout';
  title?: string;
  message?: string;
  onRetry?: () => void;
  showSupport?: boolean;
  className?: string;
}

export class ProfessionalErrorBoundary extends React.Component<
  ProfessionalErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: ProfessionalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Professional Error Boundary caught an error:', error, errorInfo);
    
    // In production, send to error tracking service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      });
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full"
  >
    <Card className="bg-background-secondary border-red-500/20 rounded-xl overflow-hidden">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Something went wrong
        </h3>
        
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          We encountered an unexpected error. Our team has been notified and is working to resolve this issue.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetError}
            className="bg-accent-primary hover:bg-accent-primary/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="bg-background-tertiary hover:bg-gray-700 text-text-primary px-6 py-2 rounded-lg transition-colors border border-gray-700"
          >
            Reload Page
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-text-secondary cursor-pointer hover:text-text-primary">
              Error Details (Development)
            </summary>
            <pre className="mt-2 p-3 bg-background-tertiary rounded-lg text-xs text-red-400 overflow-auto">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export const BridgeErrorState: React.FC<ErrorStateProps> = ({
  title = "Bridge Analysis Unavailable",
  message = "We're having trouble connecting to bridge data providers. This may be due to high network traffic or temporary service issues.",
  onRetry,
  showSupport = true,
  className = ""
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <Card className="bg-background-secondary border-orange-500/20 rounded-xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-orange-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Badge variant="outline" className="text-orange-400 border-orange-400/20">
            <Clock className="w-3 h-3 mr-1" />
            Temporary Issue
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400/20">
            <Server className="w-3 h-3 mr-1" />
            Service Degraded
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-orange-500 hover:bg-orange-500/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Analysis</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-background-tertiary hover:bg-gray-700 text-text-primary px-6 py-2 rounded-lg transition-colors border border-gray-700"
          >
            Refresh Page
          </button>
        </div>
        
        {showSupport && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <p className="text-xs text-text-secondary mb-2">
              Issue persisting? Check our status page or contact support.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="#"
                className="text-xs text-accent-primary hover:text-accent-primary/80 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Status Page</span>
              </a>
              <a
                href="#"
                className="text-xs text-accent-primary hover:text-accent-primary/80 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Support</span>
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export const KaitoErrorState: React.FC<ErrorStateProps> = ({
  title = "Kaito Analysis Unavailable",
  message = "We're unable to fetch your Kaito social metrics at the moment. This could be due to API rate limits or temporary service issues.",
  onRetry,
  showSupport = true,
  className = ""
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <Card className="bg-gradient-to-br from-purple-900/10 to-blue-900/10 border-purple-500/20 rounded-xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wifi className="w-8 h-8 text-purple-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          <Badge variant="outline" className="text-purple-400 border-purple-400/20">
            <Clock className="w-3 h-3 mr-1" />
            Rate Limited
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400/20">
            <Server className="w-3 h-3 mr-1" />
            API Issue
          </Badge>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-purple-500 hover:bg-purple-500/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Analysis</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-background-tertiary hover:bg-gray-700 text-text-primary px-6 py-2 rounded-lg transition-colors border border-gray-700"
          >
            Refresh Page
          </button>
        </div>
        
        {showSupport && (
          <div className="mt-6 pt-6 border-t border-gray-700/50">
            <p className="text-xs text-text-secondary mb-2">
              Try again in a few minutes or check if your Twitter account is properly linked to Kaito.
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://kaito.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-accent-primary hover:text-accent-primary/80 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Visit Kaito</span>
              </a>
              <a
                href="#"
                className="text-xs text-accent-primary hover:text-accent-primary/80 flex items-center space-x-1"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Link Account</span>
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

export const NetworkErrorState: React.FC<ErrorStateProps> = ({
  title = "Network Connection Issue",
  message = "We're having trouble connecting to our services. Please check your internet connection and try again.",
  onRetry,
  className = ""
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className={className}
  >
    <Card className="bg-background-secondary border-red-500/20 rounded-xl">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wifi className="w-8 h-8 text-red-400" />
        </div>
        
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {title}
        </h3>
        
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          {message}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-red-500 hover:bg-red-500/80 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
          
          <button
            onClick={() => window.location.reload()}
            className="bg-background-tertiary hover:bg-gray-700 text-text-primary px-6 py-2 rounded-lg transition-colors border border-gray-700"
          >
            Reload Page
          </button>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Partial data display component for graceful degradation
export const PartialDataDisplay: React.FC<{
  availableData: string[];
  unavailableData: string[];
  children: React.ReactNode;
}> = ({ availableData, unavailableData, children }) => (
  <div className="space-y-4">
    {unavailableData.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3"
      >
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-400">Partial Data Available</span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Some analysis features are temporarily unavailable: {unavailableData.join(', ')}
        </p>
      </motion.div>
    )}
    {children}
  </div>
);