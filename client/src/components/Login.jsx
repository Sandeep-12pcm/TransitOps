import React, { useState } from 'react';
import { api } from '../utils/api';

const DEMO_ACCOUNTS = [
  { role: 'Fleet Manager', email: 'manager@transitops.com', pw: 'password123' },
  { role: 'Driver', email: 'driver.alex@transitops.com', pw: 'password123' },
  { role: 'Safety Officer', email: 'safety@transitops.com', pw: 'password123' },
  { role: 'Financial Analyst', email: 'finance@transitops.com', pw: 'password123' },
];

export default function Login({ setUser, toast }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillDemo = (demoEmail, demoPw) => {
    setEmail(demoEmail);
    setPassword(demoPw);
    setError('');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await api.login(trimmedEmail, password);
      toast(`Welcome back, ${data.user.name}!`, 'success');
      setUser(data.user);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="login-page">
      <div className="login-bg"></div>
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">🚚</div>
          <div className="logo-text">
            <strong>TransitOps</strong>
            <span>Smart Transport Operations Platform</span>
          </div>
        </div>
        <h2>Welcome back</h2>
        <p>Sign in to access your operational dashboard</p>
        
        <div className="demo-accounts">
          <h4>Demo Accounts – click to fill</h4>
          {DEMO_ACCOUNTS.map(r => (
            <div className="demo-row" key={r.role}>
              <span className="demo-role">{r.role}</span>
              <span className="demo-creds">{r.email}</span>
              <button 
                className="demo-fill-btn" 
                type="button" 
                onClick={() => fillDemo(r.email, r.pw)}
              >
                Fill
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-control" 
              type="email" 
              placeholder="you@transitops.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Password</label>
            <input 
              className="form-control" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            {error && (
              <div className="form-error" style={{ display: 'block', marginTop: '8px' }}>
                ❌ {error}
              </div>
            )}
          </div>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center' }} 
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In →'}
          </button>
        </form>
        <p className="text-center text-muted mt-12 fs-11" style={{ margin: '20px 0 0 0', textAlign: 'center' }}>
          TransitOps © 2026 · Hackathon Demo
        </p>
      </div>
    </div>
  );
}
