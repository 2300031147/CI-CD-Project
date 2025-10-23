import React from 'react';
import { FaCrown, FaCheck } from 'react-icons/fa';
import { useAuth } from '../services/auth';
import toast from 'react-hot-toast';

function Premium() {
  const { isAuthenticated, user } = useAuth();

  const handleSubscribe = (plan) => {
    if (!isAuthenticated) {
      toast.error('Please login to subscribe');
      return;
    }
    
    // In a real app, this would integrate with Stripe
    toast.success(`Premium ${plan} subscription feature coming soon!`);
  };

  const features = [
    'Ad-free listening',
    'Unlimited downloads',
    'High-quality audio streaming',
    'Offline playback',
    'Early access to new releases',
    'Exclusive content and playlists'
  ];

  return (
    <div className="premium-page">
      <div className="premium-header">
        <FaCrown className="crown-icon" />
        <h1>Go Premium</h1>
        <p>Unlock the full music streaming experience</p>
      </div>

      <div className="features-section">
        <h2>Premium Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <FaCheck className="check-icon" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pricing-section">
        <h2>Choose Your Plan</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Monthly</h3>
            <div className="price">
              <span className="amount">$9.99</span>
              <span className="period">/month</span>
            </div>
            <ul className="plan-features">
              <li>Cancel anytime</li>
              <li>All premium features</li>
              <li>No commitment</li>
            </ul>
            <button 
              onClick={() => handleSubscribe('monthly')} 
              className="subscribe-btn"
              disabled={user?.is_premium}
            >
              {user?.is_premium ? 'Already Premium' : 'Subscribe Monthly'}
            </button>
          </div>

          <div className="pricing-card featured">
            <div className="badge">Best Value</div>
            <h3>Yearly</h3>
            <div className="price">
              <span className="amount">$99.99</span>
              <span className="period">/year</span>
            </div>
            <p className="savings">Save $20 per year!</p>
            <ul className="plan-features">
              <li>2 months free</li>
              <li>All premium features</li>
              <li>Best value</li>
            </ul>
            <button 
              onClick={() => handleSubscribe('yearly')} 
              className="subscribe-btn"
              disabled={user?.is_premium}
            >
              {user?.is_premium ? 'Already Premium' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>
      </div>

      {user?.is_premium && (
        <div className="premium-status">
          <FaCrown />
          <p>You are already a premium member!</p>
        </div>
      )}
    </div>
  );
}

export default Premium;
