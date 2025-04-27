import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
    const navigate = useNavigate();

  // Toastify Notification Setup
  const notifySuccess = (message) => toast.success(message);
  const notifyError = (message) => toast.error(message);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!email || !password) {
      notifyError('Both fields are required.');
      return;
    }

    // Email format validation
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      notifyError('Please enter a valid email address.');
      return;
    }

    try {
      const { data } = await API.post('/users/login', { email, password });
      login(data);
      notifySuccess('Login successful! Redirecting to dashboard...');
      navigate('/dashboard');
    } catch (error) {
      console.error(error.response.data.message);
      notifyError(error.response.data.message || 'Something went wrong!');
    }
  };

  return (
    <div className="max-w-sm mx-auto p-6 mt-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
        >
          Login
        </button>
      </form>
      <div className="mt-4 text-center">
        <p>Don't have an account? <Link to="/" className="text-blue-500 hover:underline">Register here</Link></p>
      </div>
    </div>
  );
}

export default LoginPage;
