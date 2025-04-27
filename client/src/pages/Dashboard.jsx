import React, { useState, useContext } from 'react';
import TaskBoard from '../components/TaskBoard';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth(); // Assuming user info is stored in AuthContext
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!user) {
      // Handle case when the user is not logged in
      alert('Please log in to add tasks');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to perform this action');
      return;
    }

    try {
      const response = await API.post('/tasks', { title, description, assignedTo }, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token in the Authorization header
        }
      });
      
      setTitle('');
      setDescription('');
      setAssignedTo('');
      
      // Optionally, you could re-fetch tasks here or use a state update instead of page reload
      window.location.reload();
    } catch (error) {
      console.error('Error adding task:', error.response?.data?.message || error.message);
      alert('Error adding task, please try again');
    }
  };

  return (
    <div className="p-6">
      <form onSubmit={handleAdd} className="mb-6 grid grid-cols-4 gap-4">
        <input
          className="border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <input
          className="border p-2 rounded"
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Assign to"
          value={assignedTo}
          onChange={e => setAssignedTo(e.target.value)}
        />
        <button type="submit" className="bg-blue-500 text-white px-4 rounded">Add Task</button>
      </form>

      <TaskBoard />
    </div>
  );
};

export default Dashboard;
