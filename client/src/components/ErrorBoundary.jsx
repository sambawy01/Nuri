import { Component } from 'react';
import { motion } from 'framer-motion';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Nuri Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7, #EFF6FF)' }}>
          <motion.div
            className="text-center max-w-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-7xl mb-4">🦉</div>
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Oops! Nuri tripped!</h1>
            <p className="text-gray-500 font-semibold mb-6">Something went wrong, but don't worry — let's try again!</p>
            <motion.button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/home';
              }}
              className="px-8 py-3 rounded-2xl text-white font-bold shadow-lg"
              style={{ background: 'linear-gradient(135deg, #F97316, #A855F7)' }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Home
            </motion.button>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
