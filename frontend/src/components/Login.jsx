import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('doctor@lifekey.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await axios.post('/api/login', { email, password });
      
      if (data.status === 'success') {
        localStorage.setItem('lifekey_token', data.token);
        localStorage.setItem('lifekey_user', JSON.stringify(data.user));
        
        if (data.user.dept === 'ED' && data.user.name.includes('Nurse')) {
            navigate('/nurse');
        } else {
            navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-center">
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <ShieldCheck size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2>LifeKey Secure Login</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Authorized ED Personnel Only</p>
        </div>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', padding: '0.75rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Access Records'}
          </button>
        </form>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
           Simulated Auth | Protected by AES-256 (HIPAA / DISHA)
        </div>
      </div>
    </div>
  );
};

export default Login;
