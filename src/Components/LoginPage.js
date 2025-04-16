import React, { useState } from 'react';
import './LoginPage.css';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:', data);
        localStorage.setItem('userRoutes', data.token);
        navigate('/DashboardApp');
      } else {
        setErrorMessage(data.message || 'Invalid email or password.');
      }
    } catch (error) {
      setErrorMessage('Error connecting to the server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="content-section">
        <h1 className="main-title">The best Visualization</h1>
        <h2 className="sub-title">for your spatial data</h2>
        <p className="description">
        This project is a full-stack web-based Geographic Information System (GIS) platform developed using the MERN stack (MongoDB, Express.js, React, Node.js). It offers interactive 2D and 3D data visualization capabilities, user authentication, and robust data management.
        </p>
      </div>
      
      <div className="login-form">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="remember"
              name="remember"
            />
            <label htmlFor="remember">Remember me</label>
          </div>

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'SIGN IN'}
          </button>

          <div className="divider">
            <span>or sign in with:</span>
          </div>

          <div className="social-login">
            <button type="button" className="social-btn facebook">
              <i className="fa fa-facebook"></i>
            </button>
            <button type="button" className="social-btn google">
              <i className="fa fa-google"></i>
            </button>
            <button type="button" className="social-btn twitter">
              <i className="fa fa-twitter"></i>
            </button>
            <button type="button" className="social-btn github">
              <i className="fa fa-github"></i>
            </button>
          </div>
          
          <div className="links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <Link to="/signup">Create New Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;