import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900 tracking-tight">Login to Taskflow</h2>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Email</label>
            <input 
              type="email" 
              className="w-full border border-gray-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-sm">Password</label>
            <input 
              type="password" 
              className="w-full border border-gray-300 p-2.5 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-medium p-2.5 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/signup" className="text-indigo-600 font-medium hover:text-indigo-500 transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
